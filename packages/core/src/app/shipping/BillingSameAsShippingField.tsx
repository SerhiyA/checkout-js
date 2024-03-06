import React, { FunctionComponent, memo, useMemo } from 'react';

import { TranslatedString } from '@bigcommerce/checkout/locale';

import { CheckboxFormField } from '../ui/form';

export interface BillingSameAsShippingFieldProps {
    initialState?: boolean,
    onChange?(isChecked: boolean): void;
}

const BillingSameAsShippingField: FunctionComponent<BillingSameAsShippingFieldProps> = ({
    initialState,
    onChange,
}) => {
    const labelContent = useMemo(
        () => <TranslatedString id="billing.use_shipping_address_label" />,
        [],
    );

    return (
        <CheckboxFormField
            id="sameAsBilling"
            labelContent={labelContent}
            name="billingSameAsShipping"
            onChange={onChange}
            initialState={Boolean(initialState)}
        />
    );
};

export default memo(BillingSameAsShippingField);
