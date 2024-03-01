import React, { FunctionComponent, memo, useEffect, useState } from 'react';
import CheckoutStepStatus from './CheckoutStepStatus';

export interface NoissueCheckoutProgress {
    checkoutSteps: CheckoutStepStatus[]
}

const getRoundedPercentage = (partialValue:number, totalValue: number) => Math.round((partialValue * 100) / totalValue)

const NoissueCheckoutProgress: FunctionComponent<NoissueCheckoutProgress> = ({
    checkoutSteps
}) => {
    const [completeInPercents, setCompleteInPercents] = useState<number>(0)

    useEffect(() => {
        const totalSteps = checkoutSteps?.length
        const totalCompletedSteps = checkoutSteps?.filter(step => step?.isComplete)?.length
        setCompleteInPercents(getRoundedPercentage(totalCompletedSteps, totalSteps))
    }, [checkoutSteps])
    
    return (
        <div className="checkout-progress">
            <div
                className="checkout-progress__track"
                data-checkout-progress={completeInPercents}
            />
        </div>
    );
};

export default memo(NoissueCheckoutProgress);
