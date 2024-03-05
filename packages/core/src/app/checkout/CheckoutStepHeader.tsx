import classNames from 'classnames';
import { noop } from 'lodash';
import React, { FunctionComponent, memo, ReactNode } from 'react';

import { preventDefault } from '@bigcommerce/checkout/dom-utils';
import { TranslatedString } from '@bigcommerce/checkout/locale';

import { IconCheck } from '../ui/icon';

import CheckoutStepType from './CheckoutStepType';
import { NoissueSubtleButton } from '../ui/noissueSubtleButton';

export interface CheckoutStepHeaderProps {
    heading: ReactNode;
    isActive?: boolean;
    isComplete?: boolean;
    isEditable?: boolean;
    summary?: ReactNode;
    type: CheckoutStepType;
    onEdit?(type: CheckoutStepType): void;
}

const CheckoutStepHeader: FunctionComponent<CheckoutStepHeaderProps> = ({
    heading,
    isActive,
    isComplete,
    isEditable,
    onEdit,
    summary,
    type,
}) => {
    return (<div
            className={classNames('stepHeader', {
                'is-readonly': !isEditable,
                'is-clickable': isEditable && !isActive,
            })}
            onClick={preventDefault(isEditable && onEdit ? () => onEdit(type) : noop)}
        >
            <div className='stepHeader-label'>
                <div className="stepHeader-figure stepHeader-column">
                    <IconCheck
                        additionalClassName={classNames(
                            'stepHeader-counter',
                            'optimizedCheckout-step',
                            { 'stepHeader-counter--complete': isComplete },
                            { 'stepHeader-counter--isActive': isActive}
                        )}
                    />

                    <h2 className="stepHeader-title optimizedCheckout-headingPrimary">{heading}</h2>
                </div>

                <div
                    className="stepHeader-body stepHeader-column optimizedCheckout-contentPrimary"
                    data-test="step-info"
                >
                    {!isActive && isComplete && summary}
                </div>
            </div>

            {isEditable && !isActive && (
                <div className="stepHeader-actions stepHeader-column">
                    <NoissueSubtleButton
                        aria-expanded={isActive}
                        testId="step-edit-button"
                        onClick={preventDefault(isEditable && onEdit ? () => onEdit(type) : noop)}
                    >
                        <TranslatedString
                            id="common.edit_action"
                        />
                    </NoissueSubtleButton>
                </div>
            )}
        </div>
    );
};

export default memo(CheckoutStepHeader);
