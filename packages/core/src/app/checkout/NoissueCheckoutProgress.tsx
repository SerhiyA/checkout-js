import React, { FunctionComponent, memo, useEffect, useState } from 'react';
import CheckoutStepStatus from './CheckoutStepStatus';

export interface NoissueCheckoutProgressProps {
    checkoutSteps: CheckoutStepStatus[]
}

const getRoundedPercentage = (partialValue:number, totalValue: number) => Math.round((partialValue * 100) / totalValue)

const NoissueCheckoutProgress: FunctionComponent<NoissueCheckoutProgressProps> = ({
    checkoutSteps
}) => {
    const [completeInPercents, setCompleteInPercents] = useState<number>(0)

    const updateProgress = (steps: CheckoutStepStatus[]) => {
        const totalSteps = steps?.length
        const totalCompletedSteps = steps?.filter(step => step?.isComplete)?.length
        setCompleteInPercents(getRoundedPercentage(totalCompletedSteps, totalSteps))
    }

    useEffect(() => {
        updateProgress(checkoutSteps)
    }, [checkoutSteps])
    
    return (
        <div className="checkout-progress">
            <div
                className="checkout-progress__track"
                data-test="progress-track"
                data-checkout-progress={completeInPercents}
            />
        </div>
    );
};

export default memo(NoissueCheckoutProgress);
