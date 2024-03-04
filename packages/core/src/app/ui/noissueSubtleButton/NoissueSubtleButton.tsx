import classNames from 'classnames';
import React, { ButtonHTMLAttributes, FunctionComponent } from 'react';

export interface NoissueSubtleButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    isFullWidth?: boolean;
    isLoading?: boolean;
    testId?: string;
}



function getClassName(
    props: Pick<NoissueSubtleButtonProps, 'className' | 'isFullWidth' | 'isLoading'>,
) {
    const { className, isFullWidth, isLoading } = props;

    return classNames(
        'subtle-button',
        className,
        { 'subtle-button--slab': isFullWidth },
        { 'subtle-button--is-loading': isLoading },
    );
}

const NoissueSubtleButton: FunctionComponent<NoissueSubtleButtonProps> = ({
    children,
    className,
    disabled,
    isFullWidth,
    isLoading,
    testId,
    type,
    ...rest
}) => (
    <button
        {...rest}
        className={getClassName({ className, isFullWidth, isLoading })}
        data-test={testId}
        disabled={disabled || isLoading}
        type={type || 'button'}
    >
        {children}
    </button>
);

export default NoissueSubtleButton;
