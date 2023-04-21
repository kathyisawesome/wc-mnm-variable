/**
 * External dependencies
 */
import { useState } from "react";
import { useContext } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { useDebouncedCallback } from 'use-debounce';


/**
 * Internal dependencies
 */
//import './style.scss';
import { ChildContext } from '../../../context/Context';
import ProductStockStatus from './ProductStockStatus';

function ProductQty( {
	disabled,
	min,
	max,
	step = 1,
	value,
	onChange,
} ) {

	const childItem = useContext(ChildContext);

    const hasMaximum = typeof max !== 'undefined';

    const isSelectable = childItem.purchasable && childItem.in_stock;

	const handleMinusClick = () => {
		const newValue = value - step;
		if (newValue >= min) {
			onChange(newValue);
		}
	};

	const handlePlusClick = () => {
		const newValue = value + step;
		if (newValue <= max) {
			onChange(newValue);
		}
	};

	const handleInputChange = (event) => {
		const newValue = parseInt(event.target.value);
		if (newValue >= min && newValue <= max) {
			onChange(newValue);
		}
	};

	/**
	 * The goal of this function is to normalize what was inserted,
	 * but after the customer has stopped typing.
	 *
	 * It's important to wait before normalizing or we end up with
	 * a frustrating experience, for example, if the minimum is 2 and
	 * the customer is trying to type "10", premature normalizing would
	 * always kick in at "1" and turn that into 2.
	 *
	 * Copied from <QuantitySelector>
	 */
	const normalizeQuantity = useDebouncedCallback( ( initialValue ) => {
			// We copy the starting value.
			let newValue = initialValue;

			// We check if we have a maximum value, and select the lowest between what was inserted and the maximum.
			if ( hasMaximum ) {
				newValue = Math.min(
					newValue,
					// the maximum possible value in step increments.
					Math.floor( max / step ) * step
				);
			}

			// Select the biggest between what's inserted, the the minimum value in steps.
			newValue = Math.max( newValue, Math.ceil( min / step ) * step );

			// We round off the value to our steps.
			newValue = Math.floor( newValue / step ) * step;

			console.debug('new value', newValue);
			console.debug('init value', initialValue);


			// Only commit if the value has changed
			if ( newValue !== initialValue ) {
				onChange?.( newValue );
			}
		},
		300
	);

	// If out of stock or not purchasable we do not show a quantity input.
	if ( ! isSelectable ) {
		return (
			<ProductStockStatus status={childItem.availability.class} availability={childItem.availability.availability} />
		)
	}

	// Show a checkbox.
	if ( step === max ) {
		return <input type="checkbox" />
	}

	// Otherwise show the quantity input.
    return (      

        <div className="wc-mnm-block-child-item__product-quantity product-quantity">

			<div className="quantity">

				<button onClick={handleMinusClick} type="button" tabIndex="-1" aria-label="{ __( 'Reduce quantity', 'woocommmerce-mix-and-match-products' ) }" className="button button--minus">－</button>

				<input
					className="wc-block-components-product-add-to-cart-quantity qty mnm-quantity input-text"
					type="number"
					value={ value }
					min={ min }
					max={ max }
					step={ step }
					hidden={ max === 1 }
					disabled={ disabled }
					onChange={handleInputChange}
					name={`mnm_quantity[${childItem.child_id}]`}
				/>

				<button onClick={handlePlusClick} type="button" tabIndex="-1" aria-label="{ __( 'Increase quantity', 'woocommmerce-mix-and-match-products' ) }" className="button button--plus">＋</button>

			</div>
        </div>
        
    )
    
}
export default ProductQty;
