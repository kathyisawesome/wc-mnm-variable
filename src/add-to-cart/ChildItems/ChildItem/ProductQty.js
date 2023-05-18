/**
 * External dependencies
 */
import { useState } from "react";
import {useContext, RawHTML, useEffect} from '@wordpress/element';
import { sprintf, _x } from '@wordpress/i18n';
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

	let woocommerceVariationAddToCart = '.woocommerce-variation-add-to-cart';
	let singleAddToCartButton = '.single_add_to_cart_button';
	let childItemQuantityInput = '.child_item__quantity_input[type=number]';

	const enabledCart = () => {
		document.querySelectorAll(woocommerceVariationAddToCart).forEach((button) => {
			button.classList.remove('woocommerce-variation-add-to-cart-disabled');
			button.querySelector(singleAddToCartButton).classList.remove('disabled','wc-variation-selection-needed');
			button.classList.add('woocommerce-variation-add-to-cart-enabled');
		});
	};

	const disableCart = () => {
		document.querySelectorAll(woocommerceVariationAddToCart).forEach((button) => {
			button.classList.add('woocommerce-variation-add-to-cart-disabled');
			button.querySelector(singleAddToCartButton).classList.add('disabled','wc-variation-selection-needed');
			button.classList.remove('woocommerce-variation-add-to-cart-enabled');
		});
	};

	const displayMessage = (obj, message) => {
		const currentObj = obj.target.parentElement.lastElementChild;
		currentObj.innerHTML = message;
		currentObj.classList.add('show');
		setTimeout(function (){
			currentObj.innerHTML = "";
			currentObj.classList.remove('show');
		},3000);
	};

	const update_cart_message = (cartTotal) =>{
		const message_container_object = document.querySelector('.mnm_status .mnm_message_content li');
		message_container_object.querySelector('.mnm-selected-item').innerHTML = cartTotal !== null ? cartTotal : '0';
		message_container_object.querySelector('.mnm-select-min-item').innerHTML = max;
		message_container_object.querySelector('.mnm-select-max-item').innerHTML = max;
	};

	const handleCheckboxClick = (event) => {
		document.querySelectorAll('.mnm-checkbox-qty input[type="checkbox"]').forEach((element) => {
			(event.target !== element && event.target.checked) ? element.disabled = true : element.disabled = false;
		});
		if(event.target.checked) {
			enabledCart();
			update_cart_message('1');
		} else {
			disableCart();
			update_cart_message('0');
		}
	};

	const handleMinusClick = (e) => {
		const newValue = value - step;
		if (newValue >= min) {
			onChange(newValue);
			updateTotal(e);
		}else{
			updateTotal(e);
		}

	};

	const handlePlusClick = (e) => {
		const newValue = value + step;
		if (newValue <= max) {
			onChange(newValue);
			updateTotal(e);
		}else{
			displayMessage(obj,wc_mnm_params.i18n_child_item_max_qty_message.replace('%d', max));
		}
	};

	const updateTotal = useDebouncedCallback( (obj) => {
		const child_items_quantity = document.querySelectorAll('.child_item__quantity ' + childItemQuantityInput);
		if ( undefined !== child_items_quantity ){
			let cartTotal = 0;
			child_items_quantity.forEach((element, index) => {
				let currentIndex = index + 1;
				cartTotal = Number(cartTotal) + Number(element.value);
				if( cartTotal >= max ){
					enabledCart();
					if ( cartTotal > max ){
						displayMessage(obj,wc_mnm_params.i18n_child_item_max_qty_message.replace('%d', max));
					}
				}else if (cartTotal <= min){
					disableCart();
					if ( cartTotal < min ){
						displayMessage(obj,wc_mnm_params.i18n_child_item_min_qty_message.replace('%d', min));
					}
				} else {
					disableCart();
				}

				if( currentIndex === child_items_quantity.length ){
					update_cart_message(cartTotal);
					if ( cartTotal > max ){
						const extraQuantity = cartTotal - max;
						const currentQuantityInput = obj.target.parentElement.querySelector(childItemQuantityInput);
						currentQuantityInput.value = currentQuantityInput.value - extraQuantity;
						onChange(currentQuantityInput.value);
						updateTotal(obj);
					}
				}
			});
		}
	},300);

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
	const normalizeQuantity = useDebouncedCallback( ( initialValue, e ) => {
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
			updateTotal(e);
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

	// Required Hidden Quantity.
	if ( max && min === max ) {

		/* translators: %1$d: Quantity, %2$s: Product name. */
		let required_text = sprintf( _x( '&times;%1d <span className="screen-reader-text">%2$s</span>', '[Frontend]', 'text-domain' ), max, childItem.name );
		return (
			
			<p class="required-quantity">
				<span>{ required_text }</span>
				<input type="hidden" name={`mnm_quantity[${childItem.child_id}]`} value={max} />
			</p>
			
		)

	}


	// Show a checkbox. @todo - handle check/uncheck.
	if ( max && step === max ) {

		/* translators: %1$d: Quantity, %2$s: Product name. */
		let checkbox_label = sprintf( _x( 'Add %1d <span className="screen-reader-text">%2$s</span>', '[Frontend]', 'text-domain' ), max, childItem.name );

		return (
			<div class="quantity mnm-checkbox-qty">
				<input type="checkbox" name={`mnm_quantity[${childItem.child_id}]`} value={max} onClick={handleCheckboxClick} />
				<label for={`mnm_quantity[${childItem.child_id}]`}><RawHTML>{checkbox_label}</RawHTML></label>
			</div>
		 )

	}

	// Otherwise show the quantity input.
    return (      

        <div className="child_item__quantity product-quantity">

			<div className="quantity">

				{ WC_MNM_ADD_TO_CART_REACT_PARAMS.display_plus_minus_buttons && (
					<button onClick={handleMinusClick} type="button" tabIndex="-1" aria-label="{ __( 'Reduce quantity', 'woocommmerce-mix-and-match-products' ) }" className="button button--minus">－</button>
				) }
				
				<input
					className="child_item__quantity_input qty mnm-quantity input-text"
					type="number"
					value={ value }
					min={ min }
					max={ max }
					step={ step }
					hidden={ max === 1 }
					disabled={ disabled }
					onChange={(e) => normalizeQuantity(e.target.value,e)}
					name={`mnm_quantity[${childItem.child_id}]`}
				/>

				{ WC_MNM_ADD_TO_CART_REACT_PARAMS.display_plus_minus_buttons && (
					<button onClick={handlePlusClick} type="button" tabIndex="-1" aria-label="{ __( 'Increase quantity', 'woocommmerce-mix-and-match-products' ) }" className="button button--plus">＋</button>
				) }
				<div className="wc_mnm_child_item_error" aria-live="polite"></div>
			</div>
        </div>
        
    )
    
}
export default ProductQty;
