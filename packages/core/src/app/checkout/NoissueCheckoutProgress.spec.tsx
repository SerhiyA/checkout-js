import { mount } from 'enzyme';
import React from 'react';

import { CheckoutSelectors, CheckoutService, createCheckoutService } from '@bigcommerce/checkout-sdk';
import getCheckoutStepStatuses from './getCheckoutStepStatuses';

import { getCustomer } from '../customer/customers.mock';
import { find } from 'lodash';

import CheckoutStepType from './CheckoutStepType';
import NoissueCheckoutProgress from './NoissueCheckoutProgress';
import { getShippingAddress } from '../shipping/shipping-addresses.mock';
import { getCart } from '../cart/carts.mock';
import { getConsignment } from '../shipping/consignment.mock';
import { getOrder } from '../order/orders.mock';
import { getBillingAddress } from '../billing/billingAddresses.mock';


describe('NoissueCheckoutProgress', () => {
    let service: CheckoutService;
    let state: CheckoutSelectors;

    beforeEach(() => {
        service = createCheckoutService();
        state = service.getState();
    });

    it('renders 0 progress if no sreps are complete', () => {
        const component = mount(<NoissueCheckoutProgress checkoutSteps={getCheckoutStepStatuses(state)} />);
        expect(component.find('[data-test="progress-track"]').prop('data-checkout-progress')).toBe(0);
    });

    it('renders 25% progress if one step is complete', () => {
        jest.spyOn(state.data, 'getCustomer').mockReturnValue(getCustomer());
        const steps = getCheckoutStepStatuses(state);
        const component = mount(<NoissueCheckoutProgress checkoutSteps={steps} />);

        expect(find(steps, { type: CheckoutStepType.Customer })!.isComplete).toBe(true);
        expect(component.find('[data-test="progress-track"]').prop('data-checkout-progress')).toBe(25);
    });

    it('renders 50% progress if one two steps are complete', () => {
        jest.spyOn(state.data, 'getCustomer').mockReturnValue(getCustomer());

        jest.spyOn(state.data, 'getShippingAddress').mockReturnValue(getShippingAddress());
        jest.spyOn(state.data, 'getCart').mockReturnValue(getCart());
        jest.spyOn(state.data, 'getConsignments').mockReturnValue([getConsignment()]);
        
        const steps = getCheckoutStepStatuses(state);
        const component = mount(<NoissueCheckoutProgress checkoutSteps={steps} />);

        expect(find(steps, { type: CheckoutStepType.Customer })!.isComplete).toBe(true);
        expect(find(steps, { type: CheckoutStepType.Shipping })!.isComplete).toBe(true);
        expect(component.find('[data-test="progress-track"]').prop('data-checkout-progress')).toBe(50);
    });

    it('renders 75% progress if one three steps are complete', () => {
        jest.spyOn(state.data, 'getCustomer').mockReturnValue(getCustomer());

        jest.spyOn(state.data, 'getShippingAddress').mockReturnValue(getShippingAddress());
        jest.spyOn(state.data, 'getCart').mockReturnValue(getCart());
        jest.spyOn(state.data, 'getConsignments').mockReturnValue([getConsignment()]);

        jest.spyOn(state.data, 'getBillingAddress').mockReturnValue(getBillingAddress());

        
        const steps = getCheckoutStepStatuses(state);
        const component = mount(<NoissueCheckoutProgress checkoutSteps={steps} />);

        expect(find(steps, { type: CheckoutStepType.Customer })!.isComplete).toBe(true);
        expect(find(steps, { type: CheckoutStepType.Shipping })!.isComplete).toBe(true);
        expect(find(steps, { type: CheckoutStepType.Billing })!.isComplete).toBe(true);
        expect(component.find('[data-test="progress-track"]').prop('data-checkout-progress')).toBe(75);
    });

    it('renders 100% progress if one all steps are complete', () => {
        jest.spyOn(state.data, 'getCustomer').mockReturnValue(getCustomer());

        jest.spyOn(state.data, 'getShippingAddress').mockReturnValue(getShippingAddress());
        jest.spyOn(state.data, 'getCart').mockReturnValue(getCart());
        jest.spyOn(state.data, 'getConsignments').mockReturnValue([getConsignment()]);

        jest.spyOn(state.data, 'getBillingAddress').mockReturnValue(getBillingAddress());

        jest.spyOn(state.data, 'getOrder').mockReturnValue(getOrder());

        
        const steps = getCheckoutStepStatuses(state);
        const component = mount(<NoissueCheckoutProgress checkoutSteps={steps} />);

        expect(find(steps, { type: CheckoutStepType.Customer })!.isComplete).toBe(true);
        expect(find(steps, { type: CheckoutStepType.Shipping })!.isComplete).toBe(true);
        expect(find(steps, { type: CheckoutStepType.Billing })!.isComplete).toBe(true);
        expect(find(steps, { type: CheckoutStepType.Payment })!.isComplete).toBe(true);
        expect(component.find('[data-test="progress-track"]').prop('data-checkout-progress')).toBe(100);
    });
});
