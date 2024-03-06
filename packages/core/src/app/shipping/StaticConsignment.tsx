import { Cart, Consignment } from '@bigcommerce/checkout-sdk';
import React, { FunctionComponent, memo } from 'react';

import { isPayPalConnectAddress, PoweredByPaypalConnectLabel, usePayPalConnectAddress } from '@bigcommerce/checkout/paypal-fastlane-integration';

import { AddressType, StaticAddress } from '../address';

import { StaticShippingOption } from './shippingOption';
import './StaticConsignment.scss';
import StaticConsignmentItemList from './StaticConsignmentItemList';
import { TranslatedString } from '@bigcommerce/checkout/locale';
import { IconCheck } from '../ui/icon';

interface StaticConsignmentProps {
    consignment: Consignment;
    cart: Cart;
    compactView?: boolean;
}

const StaticConsignment: FunctionComponent<StaticConsignmentProps> = ({
    consignment,
    cart,
    compactView,
}) => {
    const { isPayPalAxoEnabled, paypalConnectAddresses } = usePayPalConnectAddress();
    const { shippingAddress: address, selectedShippingOption } = consignment;

    const showPayPalConnectAddressLabel = isPayPalAxoEnabled && isPayPalConnectAddress(address, paypalConnectAddresses);

    return (
        <div className="staticConsignment">
            <StaticAddress address={address} type={AddressType.Shipping} />

            {showPayPalConnectAddressLabel && <PoweredByPaypalConnectLabel />}

            {!compactView && <StaticConsignmentItemList cart={cart} consignment={consignment} />}

            {selectedShippingOption && (
                <div className="staticConsignment__shipping-method">
                    <div className="staticConsignment__method-heading">
                        <IconCheck
                            additionalClassName="stepHeader-counter stepHeader-counter--complete"
                        />
                        <h2 className="staticConsignment__method-label">
                            <TranslatedString id="shipping.shipping_method_label" />
                        </h2>
                    </div>

                    <div className="shippingOption shippingOption--alt shippingOption--selected">
                        <StaticShippingOption
                            displayAdditionalInformation={false}
                            method={selectedShippingOption}
                        />
                    </div>
                </div>
            )}
        </div>
    );
};

export default memo(StaticConsignment);
