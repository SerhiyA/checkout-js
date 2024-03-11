import classNames from 'classnames';
import { isNumber } from 'lodash';
import React, { FunctionComponent, memo, ReactNode } from 'react';

import { ShopperCurrency } from '../currency';

export interface OrderSummaryItemProps {
    id: string | number;
    amount: number;
    quantity: number;
    name: string;
    amountAfterDiscount?: number;
    image?: ReactNode;
    description?: ReactNode;
    productOptions?: OrderSummaryItemOption[];
}

export interface OrderSummaryItemOption {
    testId: string;
    content: ReactNode;
}

const EXCLUDED_PRODUCT_OPTIONS = [
    'Customizations',
    'Metadata',
    'Reorder'
]

const isExcludedOption = (optionValue: string) => {
    return EXCLUDED_PRODUCT_OPTIONS.some(option => { 
        const regex = new RegExp(`\\b${option}\\b`)
        return regex.test(optionValue)
    })
}

const formatProductName = (name: string) => {
    return name?.split('|')?.[0] || name
}

const OrderSummaryItem: FunctionComponent<OrderSummaryItemProps> = ({
    amount,
    amountAfterDiscount,
    image,
    name,
    productOptions,
    quantity,
    description,
}) => (
    <div className="product" data-test="cart-item">
        <div className="product__header">
            <h4
                className="product-title optimizedCheckout-contentPrimary"
                data-test="cart-item-product-title"
            >
                {`${quantity} x ${formatProductName(name)}`}
            </h4>

            <div className="product-actions">
                <div
                    className={classNames('product-price', 'optimizedCheckout-contentPrimary', {
                        'product-price--beforeDiscount':
                            isNumber(amountAfterDiscount) && amountAfterDiscount !== amount,
                    })}
                    data-test="cart-item-product-price"
                >
                    <ShopperCurrency amount={amount} />
                </div>

                {isNumber(amountAfterDiscount) && amountAfterDiscount !== amount && (
                    <div className="product-price" data-test="cart-item-product-price--afterDiscount">
                        <ShopperCurrency amount={amountAfterDiscount} />
                    </div>
                )}
            </div>
        </div>
        
        <figure className="product-column product-figure">{image}</figure>

        <div className="product-column product-body">
            {productOptions && productOptions.length > 0 && (
                <ul
                    className="product-options optimizedCheckout-contentSecondary"
                    data-test="cart-item-product-options"
                >
                    {productOptions.map((option, index) => {
                        if (!isExcludedOption(String(option.content))) {
                                return <li
                                    className="product-option"
                                    data-test={option.testId}
                                    key={index}
                                >
                                    {option.content}
                                </li>
                            }
                        }
                    ).filter(Boolean)}
                </ul>
            )}

            {description && (
                <div
                    className="product-description optimizedCheckout-contentSecondary"
                    data-test="cart-item-product-description"
                >
                    {description}
                </div>
            )}
        </div>
    </div>
);

export default memo(OrderSummaryItem);
