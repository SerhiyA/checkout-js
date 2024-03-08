import {
    Address,
    CheckoutRequestBody,
    CheckoutSelectors,
    Country,
    Customer,
    FormField,
} from '@bigcommerce/checkout-sdk';
import { noop } from 'lodash';
import React, { Component, ReactNode } from 'react';

import { CheckoutContextProps } from '@bigcommerce/checkout/payment-integration-api';
import { AddressFormSkeleton } from '@bigcommerce/checkout/ui';

import { isEqualAddress, mapAddressFromFormValues } from '../address';
import { withCheckout } from '../checkout';
import { EMPTY_ARRAY, isFloatingLabelEnabled } from '../common/utility';
import { getShippableItemsCount } from '../shipping';

import BillingForm, { BillingFormValues } from './BillingForm';
import getBillingMethodId from './getBillingMethodId';
import { addTaxNumberToAddress } from './Billing.utils';

export interface BillingProps {
    isBillingSameAsShipping: boolean;
    navigateNextStep(isBillingSameAsShipping: boolean): void;
    onReady?(): void;
    onUnhandledError(error: Error): void;
}

export interface WithCheckoutBillingProps {
    countries: Country[];
    countriesWithAutocomplete: string[];
    customer: Customer;
    customerMessage: string;
    googleMapsApiKey: string;
    isInitializing: boolean;
    isUpdating: boolean;
    shouldShowOrderComments: boolean;
    shippingAddress?: Address;
    billingAddress?: Address;
    methodId?: string;
    isFloatingLabelEnabled?: boolean;
    getFields(countryCode?: string): FormField[];
    initialize(): Promise<CheckoutSelectors>;
    updateAddress(address: Partial<Address>): Promise<CheckoutSelectors>;
    updateCheckout(payload: CheckoutRequestBody): Promise<CheckoutSelectors>;
}

class Billing extends Component<BillingProps & WithCheckoutBillingProps> {
    async componentDidMount(): Promise<void> {
        const { initialize, onReady = noop, onUnhandledError } = this.props;

        try {
            await initialize();
            onReady();
        } catch (error) {
            if (error instanceof Error) {
                onUnhandledError(error);
            }
        }
    }

    render(): ReactNode {
        const { updateAddress, isInitializing, methodId, ...props } = this.props;

        return (
            <AddressFormSkeleton isLoading={isInitializing}>
                <div className="checkout-form">
                    <BillingForm
                        {...props}
                        onSubmit={this.handleSubmit}
                        updateAddress={updateAddress}
                    />
                </div>
            </AddressFormSkeleton>
        );
    }

    private handleSubmit: (values: BillingFormValues) => void = async ({
        billingSameAsShipping,
        orderComment,
        taxNumber,
        ...addressValues
    }) => {
        const {
            updateAddress,
            updateCheckout,
            customerMessage,
            billingAddress,
            navigateNextStep,
            onUnhandledError,
            shippingAddress
        } = this.props;

        const promises: Array<Promise<CheckoutSelectors>> = [];
        const address = mapAddressFromFormValues(addressValues);

        let addressPayload: Address = address

        /** 
         * We don't render Tax Number field as part of regular shippingAddress or billingAddress forms
         * Instead we allow customers to edit it independetly as standalone field
         * Because of that we need to inject [taxNumber] value into addressPaylod before sending the update request
         * In the first case it ensures that when customer checks [billingSameAsShipping] checkbox and edits standalone tax number field
         * we merge the shippingAddress and taxNumber value for the payload.
         * In the second case (when customer submit a new address) it maps standalone field value to the proper field in submitted address form. 
        */
        if (billingSameAsShipping) {
            addressPayload = addTaxNumberToAddress(shippingAddress || address, taxNumber)
        } else {
            addressPayload = addTaxNumberToAddress(address, taxNumber)
        }

        if (addressPayload && !isEqualAddress(addressPayload, billingAddress)) {
            promises.push(updateAddress(addressPayload));
        }

        if (customerMessage !== orderComment) {
            promises.push(updateCheckout({ customerMessage: orderComment }));
        }

        try {
            await Promise.all(promises);
            navigateNextStep(billingSameAsShipping);
        } catch (error) {
            if (error instanceof Error) {
                onUnhandledError(error);
            }
        }
    };
}

function mapToBillingProps({
    checkoutService,
    checkoutState,
}: CheckoutContextProps): WithCheckoutBillingProps | null {
    const {
        data: {
            getCheckout,
            getConfig,
            getCart,
            getCustomer,
            getShippingAddress,
            getBillingAddress,
            getBillingAddressFields,
            getBillingCountries,
        },
        statuses: { isLoadingBillingCountries, isUpdatingBillingAddress, isUpdatingCheckout },
    } = checkoutState;

    const config = getConfig();
    const customer = getCustomer();
    const checkout = getCheckout();
    const cart = getCart();

    if (!config || !customer || !checkout || !cart) {
        return null;
    }

    const { enableOrderComments, googleMapsApiKey, features } = config.checkoutSettings;

    const countriesWithAutocomplete = ['US', 'CA', 'AU', 'NZ'];

    if (features['CHECKOUT-4183.checkout_google_address_autocomplete_uk']) {
        countriesWithAutocomplete.push('GB');
    }

    return {
        billingAddress: getBillingAddress(),
        shippingAddress: getShippingAddress(),
        countries: getBillingCountries() || EMPTY_ARRAY,
        countriesWithAutocomplete,
        customer,
        customerMessage: checkout.customerMessage,
        getFields: getBillingAddressFields,
        googleMapsApiKey,
        initialize: checkoutService.loadBillingAddressFields,
        isInitializing: isLoadingBillingCountries(),
        isUpdating: isUpdatingBillingAddress() || isUpdatingCheckout(),
        methodId: getBillingMethodId(checkout),
        shouldShowOrderComments: enableOrderComments && getShippableItemsCount(cart) < 1,
        updateAddress: checkoutService.updateBillingAddress,
        updateCheckout: checkoutService.updateCheckout,
        isFloatingLabelEnabled: isFloatingLabelEnabled(config.checkoutSettings),
    };
}

export default withCheckout(mapToBillingProps)(Billing);
