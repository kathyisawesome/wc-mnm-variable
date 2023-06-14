/**
 * External dependencies
 */
import {useContext, RawHTML, useEffect,useState} from '@wordpress/element';
import { sprintf, _x, __ } from '@wordpress/i18n';
import { useDebouncedCallback } from 'use-debounce';
import { PLACEHOLDER_IMG_SRC } from '@woocommerce/settings';

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
	onChange
} ) {

	const { childItem } = useContext(ChildContext);
	const [containerMaxSize, setContainerMaxSize] = useState(1);
	const [isCheckboxChecked, setCheckboxChecked] = useState(0);

	useEffect(() => {

		setCheckboxChecked(value);

		window.onbeforeunload = function() {
			localStorage.removeItem('productLoaded');
		};
	}, [value]);

    const hasMaximum = typeof max !== 'undefined';

    const isSelectable = childItem.purchasable && childItem.in_stock;

	const woocommerceVariationAddToCart = '.woocommerce-variation-add-to-cart';
	const singleAddToCartButton = '.single_add_to_cart_button';
	const childItemQuantityInput = '.child_item__quantity_input';
	const mixAndMatchRoot = '.wc-block-components-product-add-to-cart-loading';
	const hasButton = WC_MNM_ADD_TO_CART_REACT_PARAMS.display_plus_minus_buttons ? 'show-button' : 'hide-button';
	const childItemQuantityCheckbox = '.mnm_child_products .mnm-checkbox-qty input[type="checkbox"].mnm-quantity';
	let selectedChildItems = [];
	let imageSrc = childItem.images.length ? childItem.images[ 0 ] : PLACEHOLDER_IMG_SRC;
	imageSrc = imageSrc.src ? imageSrc.src : PLACEHOLDER_IMG_SRC;

	/**
	 * Display the loader.
	 *
	 * @since 1.0.0
	 */
	const displayLoader = () => {
		document.querySelectorAll(mixAndMatchRoot).forEach( (loader) => {
			loader.style.display = 'block';
		});
	};

	/**
	 * Remove the loader.
	 *
	 * @since 1.0.0
	 */
	const removeLoader = () => {
		document.querySelectorAll(mixAndMatchRoot).forEach( (loader) => {
			loader.style.display = 'none';
		});
	};

	/**
	 * Manage Remove child item from minicart box.
	 *
	 * @param event Event object.
	 *
	 * @since 1.0.0
	 */
	const handleRemoveChildItem = (event) => {
		displayLoader();
		const productName = event.target.getAttribute('data-product');
		const childProduct = document.querySelector(`[name="${productName}"]`);

		if (childProduct.type === 'number') {
			childProduct.value = childProduct.value - 1;
			const minusButton = childProduct.parentNode.querySelector('.button--minus');
			minusButton.dispatchEvent(clickEvent);
		} else {
			childProduct.dispatchEvent(clickEvent);
			childProduct.checked = false;
		}
	};

	/**
	 * Enable cart button.
	 *
	 * @since 1.0.0
	 */
	const enabledCart = () => {
		document.querySelectorAll(woocommerceVariationAddToCart).forEach((button) => {
			if( !button.classList.contains('variations_button') ){
				button.classList.remove('woocommerce-variation-add-to-cart-disabled');
				button.querySelector(singleAddToCartButton).classList.remove('disabled','wc-variation-selection-needed');
				button.classList.add('woocommerce-variation-add-to-cart-enabled');
			}
		});
	};

	/**
	 * Disable cart button.
	 *
	 * @since 1.0.0
	 */
	const disableCart = () => {
		document.querySelectorAll(woocommerceVariationAddToCart).forEach((button) => {
			if( !button.classList.contains('variations_button') ) {
				button.classList.add('woocommerce-variation-add-to-cart-disabled');
				button.querySelector(singleAddToCartButton).classList.add('disabled', 'wc-variation-selection-needed');
				button.classList.remove('woocommerce-variation-add-to-cart-enabled');
			}
		});
	};

	/**
	 * Display validation messages.
	 *
	 * @param obj current input object.
	 * @param message display message.
	 *
	 * @since 1.0.0
	 */
	const displayMessage = (obj, message) => {
		let currentObj = '';
		if( undefined === obj.target || null === obj.target ) {
			currentObj = obj.parentElement.lastElementChild;
		} else {
			currentObj = obj.target.parentElement.lastElementChild;
		}
		currentObj.innerHTML = message;
		currentObj.classList.add('show');
		setTimeout(function (){
			currentObj.innerHTML = "";
			currentObj.classList.remove('show');
		},3000);
	};

	/**
	 * Reset cart quantity
	 *
	 * @since 1.0.0
	 */
	const resetCart = () => {
		const child_product_checkboxes = document.querySelectorAll(childItemQuantityCheckbox);
		if (child_product_checkboxes !== null && child_product_checkboxes.length > 0) {
			child_product_checkboxes.forEach((element) => {
				element.disabled = false;
				element.checked = false;
			});
		}
	};

	/**
	 * Update the cart message.
	 *
	 * @param cartTotal Get the cart total.
	 * @param mnm_max_container Get the container max value.
	 *
	 * @since 1.0.0
	 */
	const updateCartMessage = (cartTotal,mnm_max_container) => {

		let miniCartMessage = __('Completed. Your bundle is full.','wc-mnm-variable');

		if ( Number(mnm_max_container) > 0 && Number(cartTotal) < Number(mnm_max_container) - 1 ) {
			miniCartMessage = __('Please add %d items to complete.','wc-mnm-variable');
			miniCartMessage = miniCartMessage.replace('%d', Number(mnm_max_container) - Number(cartTotal));
		} else if ( Number(mnm_max_container) > 0 && Number(cartTotal) === Number(mnm_max_container) - 1) {
			miniCartMessage = __('Please add %d item more to complete.','wc-mnm-variable');
			miniCartMessage = miniCartMessage.replace('%d', Number(mnm_max_container) - Number(cartTotal));
		}

		document.querySelector('.mnm-minicart-quantity.note').innerHTML = miniCartMessage;
		document.querySelector('.mnm-cart-product-items').innerHTML = cartTotal;
		document.querySelector('.mnm-minicart-total-price').innerHTML = document.querySelector('.woocommerce-variation .woocommerce-variation-price').innerHTML;
	};

	/**
	 * Manage localstorage for update the cart quantity and add to cart button.
	 *
	 * @since 1.0.0
	 */
	let variationId = document.querySelector('.woocommerce-variation-add-to-cart .variation_id').value;
	variationId = ( undefined !== variationId && null !== variationId ) ? variationId : 0;
	if ( !localStorage.getItem('productLoaded') || !localStorage.getItem('variationId') || variationId !== localStorage.getItem('variationId') ) {
		displayLoader();
		localStorage.setItem('productLoaded', 'true');
		localStorage.setItem('variationId',variationId);
		setTimeout(function (){
			const resetCartButton = document.querySelector('.mnm-reset-cart');
			const mnm_max_container = document.querySelector('#mnm_max_container').value;
			setContainerMaxSize(mnm_max_container);
			disableCart();
			updateCartMessage(0,containerMaxSize);
			resetCart();
			selectedChildItems = [];
			updateTotal(false);
			resetCartButton.dispatchEvent(clickEvent);
			resetCartButton.addEventListener('click',handleResetCart);
		},100);
	}

	/**
	 * Manage the reset cart event.
	 *
	 * @since 1.0.0
	 */
	const handleResetCart = () => {
		disableCart();
		updateCartMessage(0,containerMaxSize);
		resetCart();
		selectedChildItems = [];
		updateTotal(false);
	};

	/**
	 * Handle checkbox click event.
	 *
	 * @param event Get the event object.
	 *
	 * @since 1.0.0
	 */
	const handleCheckboxClick = (event) => {

		selectedChildItems = [];

		if (event.target.checked) {
			enabledCart();
			updateTotal(event.target);
			setCheckboxChecked(1);
		} else {
			disableCart();
			updateTotal(event.target);
			setCheckboxChecked(0);
		}
	};

	/**
	 * Handle the minus button event.
	 *
	 * @param e Get the event object.
	 *
	 * @since 1.0.0
	 */
	const handleMinusClick = (e) => {
		displayLoader();
		const newValue = Number(value) - Number(step);
		if (newValue >= min && newValue <= max) {
			onChange(newValue);
			updateTotal(e);
		} else {
			updateTotal(e);
		}
	};

	/**
	 * Trigger click event.
	 *
	 * @type {MouseEvent | MouseEvent}
	 *
	 * @since 1.0.0
	 */
	const clickEvent = new MouseEvent('click', {
		bubbles: true,
		cancelable: true,
		view: window
	});

	/**
	 * Handle the plus button event.
	 *
	 * @param e
	 *
	 * @since 1.0.0
	 */
	const handlePlusClick = (e) => {
		displayLoader();
		const newValue = Number(value) + Number(step);
		if (newValue <= max && newValue >= min) {
			onChange(newValue);
			updateTotal(e);
		} else {
			updateTotal(e);
		}
	};

	/**
	 * Update the total quantity.
	 *
	 * @since 1.0.0
	 *
	 * @type {DebouncedState<(function(*): void)|*>}
	 */
	const updateTotal = useDebouncedCallback( (obj) => {

		displayLoader();
		selectedChildItems = [];
		const child_items_quantity = document.querySelectorAll('.child_item__quantity ' + childItemQuantityInput);
		const mnm_min_container = document.querySelector('#mnm_min_container').value;
		const mnm_max_container = document.querySelector('#mnm_max_container').value;

		if ( null !== child_items_quantity && child_items_quantity.length > 0 ) {
			let objectTypeCheckbox = false;
			if( obj ){
				objectTypeCheckbox = undefined === obj.target ? obj.type === 'checkbox' : obj.target.type === 'checkbox';
			}
			let cartTotal = 0;
			child_items_quantity.forEach((element, index) => {
				let isCheckbox = ( element.type === 'checkbox');
				let checkboxSelected = isCheckbox ? element.checked : true;

				if( element.value > 0 && checkboxSelected ){
					for (let i = 0 ; i < element.value; i++){
						selectedChildItems.push({ image: element.getAttribute('data-src'), title: element.getAttribute('data-title'), name: element.getAttribute('name'), dataId: element.getAttribute('data-id'), required: element.getAttribute('data-required') });
					}
				}
				let currentIndex = index + 1;

				if( checkboxSelected ){
					cartTotal = Number(cartTotal) + Number(element.value);
				}
				if ( cartTotal >= mnm_max_container ) {
					enabledCart();
					if ( obj && ( cartTotal > mnm_max_container || element.value > max ) && checkboxSelected ) {
						displayMessage(obj,wc_mnm_params.i18n_child_item_max_qty_message.replace('%d', element.value > max ? max : mnm_max_container));
					}
				} else if (cartTotal <= mnm_min_container) {
					disableCart();
					if ( obj && element.value < min && checkboxSelected ) {
						displayMessage(obj,wc_mnm_params.i18n_child_item_min_qty_message.replace('%d', min));
					}
				} else {
					disableCart();
				}

				if ( currentIndex === child_items_quantity.length ) {
					if ( obj && cartTotal > mnm_max_container ) {
						const extraQuantity = cartTotal - mnm_max_container;
						let currentQuantityInput = '';
						if( ! objectTypeCheckbox && undefined === obj.target || null === obj.target ) {
							currentQuantityInput = obj.parentElement.querySelector(childItemQuantityInput);
						} else if( ! objectTypeCheckbox ) {
							currentQuantityInput = obj.target.parentElement.querySelector(childItemQuantityInput);
						}

						if( objectTypeCheckbox ){
							obj.checked = false;
							onChange(0);
						} else {
							currentQuantityInput.value = currentQuantityInput.value - extraQuantity;
							onChange(currentQuantityInput.value);
						}
						updateTotal(obj);
					} else {
						displaySelectedProducts(mnm_max_container - cartTotal);
						updateCartMessage(cartTotal,mnm_max_container);
					}
				}
			});
		}
	},300);

	/**
	 * Display selected products.
	 *
	 * @param placeholderQuantity Get the placeholder count.
	 *
	 * @since 1.0.0
	 */
	const displaySelectedProducts = (placeholderQuantity) => {
		displayLoader();
		let mnmMiniCartContentContainer = document.querySelector('.mnm-minicart-view-content-container ');
		let displaySelectedItem = [];
		if( selectedChildItems.length > 0 ){
			Object.entries(selectedChildItems).map(([index,selectedItem]) => {
				displaySelectedItem.push(selectedItem);
			});
		}
		if( Number( placeholderQuantity) > 0 ){
			for(let i = 0; i < Number(placeholderQuantity) ; i++ ) {
				displaySelectedItem.push({image: PLACEHOLDER_IMG_SRC, title: __('Empty','wc-mnm-variable'), name: ''});
			}
		}

		mnmMiniCartContentContainer.innerHTML = '';
		if (displaySelectedItem.length > 0 ){
			displaySelectedItem.map( (item, index)  => {
				mnmMiniCartContentContainer.innerHTML += getProductHTML(item);
				if( index + 1 === displaySelectedItem.length  ){
					removeLoader();
					document.querySelectorAll('.remove-child-item').forEach((childItem) => {
						childItem.addEventListener('click', handleRemoveChildItem);
						return () => {
							childItem.removeEventListener('click', handleRemoveChildItem);
						};
					});
				}
			});
		}
	};

	/**
	 * Get selected child product structure.
	 *
	 * @param obj Get the product object.
	 *
	 * @since 1.0.0
	 *
	 * @returns {`<div class="minicart-product-grid">
	 * 			${string|string}
	 * 			<img src="${string}"/>
	 * 			<h4>${string}</h4>
	 * 		</div>`}
	 */
	const getProductHTML = ( obj ) => {
		let closeButton = (obj.name !== '' && obj.required !== 'true') ? `<span class="remove-child-item" data-id="${obj.dataId}" data-product="${obj.name}">×</span>`: '';

		return `<div class="minicart-product-grid">
				${closeButton}
				<img src="${obj.image}"/>
				<h4>${obj.title}</h4>
			</div>`;
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
	const normalizeQuantity = useDebouncedCallback( ( initialValue, e ) => {
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
	},300);

	// If out of stock or not purchasable we do not show a quantity input.
	if ( ! isSelectable ) {
		return (
			<ProductStockStatus status={childItem.availability.class} availability={childItem.availability.availability} />
		)
	}

	// Required Hidden Quantity.
	if ( max && min === max ) {

		/* translators: %1$d: Quantity, %2$s: Product name. */
		let required_text = sprintf( _x( '&times;%1d <span class="screen-reader-text">%2$s</span>', '[Frontend]', 'wc-mnm-variable' ), max, childItem.name );
		return (
			
			<p className="required-quantity child_item__quantity">
				<span><RawHTML>{ required_text }</RawHTML></span>
				<input type="hidden" data-required={true} data-title={childItem.name} data-src={imageSrc} data-id={childItem.child_id} className={'child_item__quantity_input qty mnm-quantity input-text'} name={`mnm_quantity[${childItem.child_id}]`} value={max} />
				<div className="wc_mnm_child_item_error" aria-live="polite"></div>
			</p>
			
		)

	}

	/**
	 * Show a checkbox.
	 *
	 * @since 1.0.0
	 */
	if ( max && step === max ) {
		/* translators: %1$d: Quantity, %2$s: Product name. */
		let checkbox_label = sprintf( _x( 'Add %1d <span class="screen-reader-text">%2$s</span>', '[Frontend]', 'text-domain' ), max, childItem.name );

		return (
			<div className="product-quantity">
				<div className="quantity mnm-checkbox-qty child_item__quantity">
					<input checked={isCheckboxChecked>0} className="qty mnm-quantity child_item__quantity_input" data-required={false} data-title={childItem.name} data-src={imageSrc} type="checkbox" name={`mnm_quantity[${childItem.child_id}]`} value={max} onClick={handleCheckboxClick} />
					<label for={`mnm_quantity[${childItem.child_id}]`} className={"mnm-checkbox-qty-label"}><RawHTML>{checkbox_label}</RawHTML></label>
					<div className="wc_mnm_child_item_error" aria-live="polite"></div>
				</div>
			</div>
		 )
	}

	// Otherwise show the quantity input.
    return (      

        <div className={`child_item__quantity product-quantity ${hasButton}`}>

			<div className="quantity">

				<button onClick={handleMinusClick} type="button" tabIndex="-1" aria-label="{ __( 'Reduce quantity', 'wc-mnm-variable' ) }" className={`button button--minus wp-element-button ${hasButton === 'hide-button' ? 'hidden' : ''}`}>－</button>
				
				<input
					className="child_item__quantity_input qty mnm-quantity input-text qty text"
					type="number"
					value={ value }
					min={ min }
					max={ max }
					step={ step }
					hidden={ max === 1 }
					disabled={ disabled }
					onChange={(e) => normalizeQuantity(e.target.value,e)}
					data-title={childItem.name}
					data-src={imageSrc}
					name={`mnm_quantity[${childItem.child_id}]`}
					data-required={false}
					data-id={childItem.child_id}
				/>

				{ WC_MNM_ADD_TO_CART_REACT_PARAMS.display_plus_minus_buttons && (
					<button onClick={handlePlusClick} type="button" tabIndex="-1" aria-label="{ __( 'Increase quantity', 'wc-mnm-variable' ) }" className="button button--plus wp-element-button">＋</button>
				) }
				<div className="wc_mnm_child_item_error" aria-live="polite"></div>
			</div>
        </div>
        
    )
    
}
export default ProductQty;
