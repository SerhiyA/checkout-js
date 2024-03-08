import { FieldProps } from 'formik';
import React, { FunctionComponent, useCallback, useMemo } from 'react';

import { Fieldset, FormField, Label, Legend, TextInput } from '../ui/form';
import { TranslatedString } from '@bigcommerce/checkout/locale';

const LEGEND_LABEL = 'Tax Number (GST/VAT)'
const FIELD_LABEL = '(GST/VAT)'

export interface StandaloneFormTextFieldProps {
    label?: string;
    required?: boolean;
}

const StanaloneTaxNumberField: FunctionComponent<StandaloneFormTextFieldProps> = ({ label, required = false }) => {
    const renderLabel = useCallback(
        (name) => (
            <Label htmlFor={name}>
                {FIELD_LABEL}
                {!required && (
                    <>
                        {' '}
                        <small className="optimizedCheckout-contentSecondary">
                            <TranslatedString id="common.optional_text" />
                        </small>
                    </>
                )}
            </Label>
        ),
        [label, required],
    );

    const renderInput = useCallback(
        ({ field }: FieldProps) => <TextInput {...field} id={field.name} autoComplete="off" maxLength={2000} />,
        [],
    );

    const legend = useMemo(
        () => (
            <Legend>
               {LEGEND_LABEL}
               <p>If you are a business, enter this code to exclude taxes.</p>
            </Legend>
        ),
        [],
    );

    return (
        <Fieldset legend={legend} testId="checkout-standalone-tax-number-field">
            <FormField
                input={renderInput}
                label={renderLabel}
                name="taxNumber"
                additionalClassName="form-field--text"
            />
        </Fieldset>
    );
};

export default StanaloneTaxNumberField;
