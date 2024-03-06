import {
    Address,
    CheckoutSelectors,
    Country,
    Customer,
    FormField,
} from '@bigcommerce/checkout-sdk';
import { FormikProps, withFormik } from 'formik';
import React, { RefObject, useRef, useState } from 'react';
import { lazy } from 'yup';

import { TranslatedString, withLanguage, WithLanguageProps } from '@bigcommerce/checkout/locale';
import { usePayPalConnectAddress } from '@bigcommerce/checkout/paypal-fastlane-integration';
import { AddressFormSkeleton } from '@bigcommerce/checkout/ui';

import {
    AddressForm,
    AddressFormValues,
    AddressSelect,
    AddressType,
    getAddressFormFieldsValidationSchema,
    getTranslateAddressError,
    isValidCustomerAddress,
    mapAddressToFormValues,
} from '../address';
import { getCustomFormFieldsValidationSchema } from '../formFields';
import { OrderComments } from '../orderComments';
import { Button, ButtonVariant } from '../ui/button';
import { Fieldset, Form } from '../ui/form';
import { LoadingOverlay } from '../ui/loading';

import StaticBillingAddress from './StaticBillingAddress';
import BillingSameAsShippingField from '../shipping/BillingSameAsShippingField';

export type BillingFormValues = AddressFormValues & { orderComment: string } & { billingSameAsShipping: boolean };

export interface BillingFormProps {
    isBillingSameAsShipping: boolean;
    billingAddress?: Address;
    countries: Country[];
    countriesWithAutocomplete: string[];
    customer: Customer;
    customerMessage: string;
    googleMapsApiKey: string;
    isUpdating: boolean;
    methodId?: string;
    shouldShowOrderComments: boolean;
    isFloatingLabelEnabled?: boolean;
    getFields(countryCode?: string): FormField[];
    onSubmit(values: BillingFormValues): void;
    onUnhandledError(error: Error): void;
    updateAddress(address: Partial<Address>): Promise<CheckoutSelectors>;
}

const BillingForm = ({
    isBillingSameAsShipping,
    googleMapsApiKey,
    billingAddress,
    countriesWithAutocomplete,
    customer: { addresses, isGuest },
    getFields,
    countries,
    isUpdating,
    setFieldValue,
    shouldShowOrderComments,
    values,
    methodId,
    isFloatingLabelEnabled,
    updateAddress,
    onUnhandledError,
}: BillingFormProps & WithLanguageProps & FormikProps<BillingFormValues>) => {
    const [isResettingAddress, setIsResettingAddress] = useState(false);
    const [editingAddress, setEditingAddress] = useState(!isBillingSameAsShipping)
 
    const addressFormRef: RefObject<HTMLFieldSetElement> = useRef(null);
    const { isPayPalAxoEnabled, mergedBcAndPayPalConnectAddresses } = usePayPalConnectAddress();

    const shouldRenderStaticAddress = methodId === 'amazonpay';
    const allFormFields = getFields(values.countryCode);
    const customFormFields = allFormFields.filter(({ custom }) => custom);
    const hasCustomFormFields = customFormFields.length > 0;
    const editableFormFields =
        shouldRenderStaticAddress && hasCustomFormFields ? customFormFields : allFormFields;
    const billingAddresses = isPayPalAxoEnabled ? mergedBcAndPayPalConnectAddresses : addresses;
    const hasAddresses = billingAddresses?.length > 0;
    const hasValidCustomerAddress =
        billingAddress &&
        isValidCustomerAddress(
            billingAddress,
            billingAddresses,
            getFields(billingAddress.countryCode),
        );

    const handleSelectAddress = async (address: Partial<Address>) => {
        setIsResettingAddress(true);

        try {
            await updateAddress(address);
        } catch (error) {
            if (error instanceof Error) {
                onUnhandledError(error);
            }
        } finally {
            setIsResettingAddress(false);
        }
    };

    const handleUseNewAddress = () => {
        handleSelectAddress({});
    };

    return (
        <Form autoComplete="on">
            <div className="form-body">
                <BillingSameAsShippingField
                    onChange={(isChecked) => setEditingAddress(!isChecked)}
                />
            </div>

            {shouldRenderStaticAddress && billingAddress && (
                <div className="form-fieldset">
                    <StaticBillingAddress address={billingAddress} />
                </div>
            )}

            {editingAddress && (
                <Fieldset id="checkoutBillingAddress" ref={addressFormRef}>
                    {hasAddresses && !shouldRenderStaticAddress && (
                        <Fieldset id="billingAddresses">
                            <LoadingOverlay isLoading={isResettingAddress}>
                                <AddressSelect
                                    addresses={billingAddresses}
                                    onSelectAddress={handleSelectAddress}
                                    onUseNewAddress={handleUseNewAddress}
                                    selectedAddress={
                                        hasValidCustomerAddress ? billingAddress : undefined
                                    }
                                    type={AddressType.Billing}
                                />
                            </LoadingOverlay>
                        </Fieldset>
                    )}

                    {!hasValidCustomerAddress && (
                        <AddressFormSkeleton isLoading={isResettingAddress}>
                            <AddressForm
                                countries={countries}
                                countriesWithAutocomplete={countriesWithAutocomplete}
                                countryCode={values.countryCode}
                                formFields={editableFormFields}
                                googleMapsApiKey={googleMapsApiKey}
                                isFloatingLabelEnabled={isFloatingLabelEnabled}
                                setFieldValue={setFieldValue}
                                shouldShowSaveAddress={!isGuest}
                            />
                        </AddressFormSkeleton>
                    )}
                </Fieldset>
            )}

            {shouldShowOrderComments && <OrderComments />}

            <div className="form-actions">
                <Button
                    disabled={isUpdating || isResettingAddress}
                    id="checkout-billing-continue"
                    isLoading={isUpdating || isResettingAddress}
                    type="submit"
                    variant={ButtonVariant.Primary}
                >
                    <TranslatedString id="common.continue_action" />
                </Button>
            </div>
        </Form>
    );
};

export default withLanguage(
    withFormik<BillingFormProps & WithLanguageProps, BillingFormValues>({
        handleSubmit: (values, { props: { onSubmit } }) => {
            onSubmit(values);
        },
        mapPropsToValues: ({ getFields, customerMessage, billingAddress, isBillingSameAsShipping }) => ({
            ...mapAddressToFormValues(
                getFields(billingAddress && billingAddress.countryCode),
                billingAddress,
            ),
            orderComment: customerMessage,
            billingSameAsShipping: isBillingSameAsShipping
        }),
        isInitialValid: ({ billingAddress, getFields, language }) =>
            !!billingAddress &&
            getAddressFormFieldsValidationSchema({
                language,
                formFields: getFields(billingAddress.countryCode),
            }).isValidSync(billingAddress),
        validationSchema: ({
            language,
            getFields,
            methodId,
        }: BillingFormProps & WithLanguageProps) =>
            methodId === 'amazonpay'
                ? lazy<Partial<AddressFormValues>>((values) =>
                      getCustomFormFieldsValidationSchema({
                          translate: getTranslateAddressError(language),
                          formFields: getFields(values && values.countryCode),
                      }),
                  )
                : lazy<Partial<AddressFormValues>>((values) =>
                      getAddressFormFieldsValidationSchema({
                          language,
                          formFields: getFields(values && values.countryCode),
                      }),
                  ),
        enableReinitialize: true,
    })(BillingForm),
);
