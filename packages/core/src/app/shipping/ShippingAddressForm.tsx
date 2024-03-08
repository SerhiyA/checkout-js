import {
    Address,
    Consignment,
    Country,
    CustomerAddress,
    FormField,
} from '@bigcommerce/checkout-sdk';
import React, { Component, ReactNode } from 'react';

import { AddressForm, AddressSelect, AddressType, isValidCustomerAddress } from '../address';
import { connectFormik, ConnectFormikProps } from '../common/form';
import { Fieldset } from '../ui/form';
import { LoadingOverlay } from '../ui/loading';

import { SingleShippingFormValues } from './SingleShippingForm';

export interface ShippingAddressFormProps {
    addresses: CustomerAddress[];
    address?: Address;
    consignments: Consignment[];
    countries?: Country[];
    countriesWithAutocomplete: string[];
    googleMapsApiKey?: string;
    isLoading: boolean;
    formFields: FormField[];
    shouldShowSaveAddress?: boolean;
    isFloatingLabelEnabled?: boolean;
    onUseNewAddress(): void;
    onFieldChange(fieldName: string, value: string): void;
    onAddressSelect(address: Address): void;
}

const addressFieldName = 'shippingAddress';

const TAX_NUMBER_FIELD_NAME = 'field_27';

const OMITTED_FIELDS: string[] = [
    TAX_NUMBER_FIELD_NAME,
];
class ShippingAddressForm extends Component<
    ShippingAddressFormProps & ConnectFormikProps<SingleShippingFormValues>
> {
    render(): ReactNode {
        const {
            addresses,
            address: shippingAddress,
            onAddressSelect,
            onUseNewAddress,
            shouldShowSaveAddress,
            countries,
            countriesWithAutocomplete,
            formFields,
            isLoading,
            googleMapsApiKey,
            isFloatingLabelEnabled,
            formik: {
                values: { shippingAddress: formAddress },
            },
        } = this.props;

        const hasAddresses = addresses && addresses.length > 0;
        const hasValidCustomerAddress = isValidCustomerAddress(
            shippingAddress,
            addresses,
            formFields,
        );
        const editableFormFields = formFields.filter(({ name }) => !OMITTED_FIELDS.includes(name))

        return (
            <Fieldset id="checkoutShippingAddress">
                {hasAddresses && (
                    <Fieldset id="shippingAddresses">
                        <LoadingOverlay isLoading={isLoading}>
                            <AddressSelect
                                addresses={addresses}
                                onSelectAddress={onAddressSelect}
                                onUseNewAddress={onUseNewAddress}
                                selectedAddress={
                                    hasValidCustomerAddress ? shippingAddress : undefined
                                }
                                type={AddressType.Shipping}
                            />
                        </LoadingOverlay>
                    </Fieldset>
                )}

                {!hasValidCustomerAddress && (
                    <LoadingOverlay isLoading={isLoading} unmountContentWhenLoading>
                        <AddressForm
                            countries={countries}
                            countriesWithAutocomplete={countriesWithAutocomplete}
                            countryCode={formAddress && formAddress.countryCode}
                            fieldName={addressFieldName}
                            formFields={editableFormFields}
                            googleMapsApiKey={googleMapsApiKey}
                            isFloatingLabelEnabled={isFloatingLabelEnabled}
                            onAutocompleteToggle={this.handleAutocompleteToggle}
                            onChange={this.handleChange}
                            setFieldValue={this.setFieldValue}
                            shouldShowSaveAddress={shouldShowSaveAddress}
                        />
                    </LoadingOverlay>
                )}
            </Fieldset>
        );
    }

    private setFieldValue: (fieldName: string, fieldValue: string) => void = (
        fieldName,
        fieldValue,
    ) => {
        const {
            formik: { setFieldValue },
            formFields,
        } = this.props;

        const customFormFieldNames = formFields
            .filter((field) => field.custom)
            .map((field) => field.name);

        const formFieldName = customFormFieldNames.includes(fieldName)
            ? `customFields.${fieldName}`
            : fieldName;

        setFieldValue(`${addressFieldName}.${formFieldName}`, fieldValue);
    };

    private handleChange: (fieldName: string, value: string) => void = (fieldName, value) => {
        const { onFieldChange } = this.props;

        onFieldChange(fieldName, value);
    };

    private handleAutocompleteToggle: (state: { inputValue: string; isOpen: boolean }) => void = ({
        isOpen,
        inputValue,
    }) => {
        const { onFieldChange } = this.props;

        if (!isOpen) {
            onFieldChange('address1', inputValue);
        }
    };
}

export default connectFormik(ShippingAddressForm);
