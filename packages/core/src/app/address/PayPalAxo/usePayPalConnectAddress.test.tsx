import { Address, CustomerAddress, PaymentProviderCustomer } from '@bigcommerce/checkout-sdk';
import { render, screen } from '@testing-library/react';
import React from 'react';

import * as PaymentIntegrationApi from '@bigcommerce/checkout/payment-integration-api';
import { getAddress, getCustomer, getStoreConfig } from '@bigcommerce/checkout/test-utils';

import { PaymentMethodId } from '../../payment/paymentMethod';

import usePayPalConnectAddress from './usePayPalConnectAddress';
import { isPayPalConnectAddress } from './utils';

interface PayPalAxoAddressComponentProps {
    selectedAddress: Address;
}

const PayPalAxoAddressComponent = ({
    selectedAddress,
}: PayPalAxoAddressComponentProps) => {
    const {
        isPayPalAxoEnabled,
        paypalConnectAddresses,
        shouldShowPayPalConnectLabel,
        mergedBcAndPayPalConnectAddresses,
    } = usePayPalConnectAddress();
    const mergedAddresses = mergedBcAndPayPalConnectAddresses;

    return (
        <>
            <div data-test="isPayPalAxoEnabled">
                {isPayPalAxoEnabled ? 'true' : 'false'}
            </div>
            <div data-test="isPayPalConnectAddress">
                {isPayPalConnectAddress(selectedAddress, paypalConnectAddresses) ? 'true' : 'false'}
            </div>
            <div data-test="shouldShowPayPalConnectLabel">
                {shouldShowPayPalConnectLabel ? 'true' : 'false'}
            </div>
            <ul>
                {mergedAddresses.map((address, index) => (
                    <li key={index}>{address.address1}</li>
                ))}
            </ul>
        </>
    );
};

describe('usePayPalConnectAddress', () => {
    const defaultStoreConfig = getStoreConfig();
    const defaultCustomer = getCustomer()

    const useCheckoutMock = (
        paymentProviderCustomer: PaymentProviderCustomer,
        customerAddress?: CustomerAddress[],
        providerWithCustomCheckout = PaymentMethodId.BraintreeAcceleratedCheckout,
    ) => {
        jest.spyOn(PaymentIntegrationApi, 'useCheckout').mockImplementation(
            jest.fn().mockImplementation(() => ({
                checkoutState: {
                    data: {
                        getPaymentProviderCustomer: () => paymentProviderCustomer,
                        getConfig: () => ({
                            ...defaultStoreConfig,
                            checkoutSettings: {
                                ...defaultStoreConfig.checkoutSettings,
                                providerWithCustomCheckout
                            },
                        }),
                        getCustomer: () => ({
                            ...defaultCustomer,
                            addresses: customerAddress,
                        }),
                    }
                }
            }))
        );
    };


    const defaultAdderss = getAddress();
    const addressBC1 = {
        ...defaultAdderss,
        id: 1,
        type: 'not-paypal',
        address1: 'address-BC1',
    };
    const addressBC2 = {
        ...defaultAdderss,
        id: 2,
        address1: 'address-BC2-PP1',
    } as CustomerAddress;
    const addressPP1 = {
        ...addressBC2,
        id: 3,
    };
    const addressPP2 = {
        ...defaultAdderss,
        id: 4,
        type: 'paypal-address',
        address1: 'address-PP2',
    };

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('renders with BC addresses & no PP Connect addresses, selected BC address', () => {
        useCheckoutMock(
            {},
            [addressBC1, addressBC2],
        );

        render(
            <PayPalAxoAddressComponent
                selectedAddress={addressBC1}
            />
        );

        const addressItems = screen.getAllByRole('listitem');

        expect(screen.getByTestId('isPayPalConnectAddress')).toHaveTextContent('false');
        expect(screen.getByTestId('shouldShowPayPalConnectLabel')).toHaveTextContent('false');
        expect(addressItems).toHaveLength(2);
        expect(addressItems[0]).toHaveTextContent('address-BC1');
        expect(addressItems[1]).toHaveTextContent('address-BC2-PP1');
    });

    it('renders with PP Connect addresses & no BC addresses, selected PP address', () => {
        useCheckoutMock(
            {addresses: [addressPP1, addressPP2]},
            [],
        );

        render(
            <PayPalAxoAddressComponent
                selectedAddress={addressPP1}
            />
        );

        const addressItems = screen.getAllByRole('listitem');

        expect(screen.getByTestId('isPayPalConnectAddress')).toHaveTextContent('true');
        expect(screen.getByTestId('shouldShowPayPalConnectLabel')).toHaveTextContent('true');
        expect(addressItems).toHaveLength(2);
        expect(addressItems[0]).toHaveTextContent('address-BC2-PP1');
        expect(addressItems[1]).toHaveTextContent('address-PP2');
    });

    it('renders with BC addresses & PP Connect address, selected BC address', () => {
        useCheckoutMock(
            {addresses: [addressPP2]},
            [addressBC1, addressBC2],
        );

        render(
            <PayPalAxoAddressComponent
                selectedAddress={addressBC1}
            />
        );

        const addressItems = screen.getAllByRole('listitem');

        expect(screen.getByTestId('isPayPalConnectAddress')).toHaveTextContent('false');
        expect(screen.getByTestId('shouldShowPayPalConnectLabel')).toHaveTextContent('true');
        expect(addressItems).toHaveLength(3);
        expect(addressItems[0]).toHaveTextContent('address-PP2');
        expect(addressItems[1]).toHaveTextContent('address-BC1');
        expect(addressItems[2]).toHaveTextContent('address-BC2-PP1');
    });

    it('renders with BC addresses & PP Connect address - with address merge, selected PP address', () => {
        useCheckoutMock(
            {addresses: [addressPP1, addressPP2]},
            [addressBC1, addressBC2],
        );

        render(
            <PayPalAxoAddressComponent
                selectedAddress={addressPP1}
            />
        );

        const addressItems = screen.getAllByRole('listitem');

        expect(screen.getByTestId('isPayPalConnectAddress')).toHaveTextContent('true');
        expect(screen.getByTestId('shouldShowPayPalConnectLabel')).toHaveTextContent('true');
        expect(addressItems).toHaveLength(3);
        expect(addressItems[0]).toHaveTextContent('address-BC2-PP1');
        expect(addressItems[1]).toHaveTextContent('address-PP2');
        expect(addressItems[2]).toHaveTextContent('address-BC1');
    });
});
