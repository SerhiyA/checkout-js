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

        if (billingSameAsShipping && shippingAddress && !isEqualAddress(shippingAddress, billingAddress)) {
            promises.push(updateAddress(shippingAddress));
        }

        if (!billingSameAsShipping && address && !isEqualAddress(address, billingAddress)) {
            promises.push(updateAddress(address));
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
