import { __ } from '@wordpress/i18n';
import { useState } from '@wordpress/element';

/**
 * Internal dependencies
 */
import './style.scss';

import ChildItems from './ChildItems/ChildItems';
import { ContainerContext } from '../context/Context';
import Loading from "./Loading";

export default function MixAndMatch( {product} ) {
    const [isVisible, setIsVisible] = useState(true);
    const [isEditable, setIsEditable] = useState(false);
    const [isReset, setIsReset] = useState(false);

  const items = 'undefined' !== typeof product.extensions.mix_and_match && 'undefined' !== typeof product.extensions.mix_and_match.child_items ? product.extensions.mix_and_match.child_items : [];
  const Categories = 'undefined' !== typeof product.extensions.mix_and_match && 'undefined' !== typeof product.extensions.mix_and_match.child_categories ? product.extensions.mix_and_match.child_categories : [];
  const maxQuantity = 'undefined' !== typeof product.add_to_cart && 'undefined' !== typeof product.add_to_cart.maximum ? product.add_to_cart.maximum : 1;
  const minQuantity = 'undefined' !== typeof product.add_to_cart && 'undefined' !== typeof product.add_to_cart.minimum ? product.add_to_cart.minimum : 1;
  const productTitle = 'undefined' !== typeof product.name ? product.name : "";
  const closeIcon = WC_MNM_ADD_TO_CART_VARIATION_PARAMS.closeWindowIcon;
  const openIcon = WC_MNM_ADD_TO_CART_VARIATION_PARAMS.openWindowIcon;

  // No child items. Should add other results, like not purchasable?
  if ( ! items || items.length === 0 ) {
    return <p>{ __( 'No child items', 'woocommmerce-mix-and-match-products' ) }</p>
  }

  const [quantity, setQuantity] = useState(minQuantity);

  const handleQuantityChange = (event) => {
    const value = Number(event.target.value);
    if (value >= minQuantity && value <= maxQuantity) {
      setQuantity(value);
    }
  };

  const handleMinicartPopup = () => {
      setIsVisible(!isVisible);
  }

  const handleEditMiniCart = () => {
    setIsEditable(!isEditable);
    const selectedProducts = document.querySelectorAll('.mnm-minicart-view-content-container .minicart-product-grid .remove-child-item');
    selectedProducts.forEach((element) => {
        if( isEditable ) {
            element.classList.add('hidden');
        } else {
            element.classList.remove('hidden');
        }
    });
  };

  const handleResetCart = () => {
    setIsReset(true);
    setTimeout(function () {
        setIsReset(false);
    },500);
  };

    return (

    <ContainerContext.Provider value={product}>
        <ChildItems childItems={items} childCategories={Categories} isEditable={isEditable} isReset={isReset}/>
            <div className={"mnm-minicart-overview mnm-variable-product-cart-view mnm-minicart-view-main"}>
                <div className={"product-minicart-overview mnm-minicart-view-container"}>
                    <div onClick={handleMinicartPopup} className={"mnm-minicart-view-title-wrapper"}>
                        <h4>{__('Your Selection','wc-mnm-variable')}</h4> <span className={`mnm-minicart-popup-icon ${isVisible ? '' : 'close'}`}><img src={`${isVisible ? closeIcon : openIcon}`} /></span>
                    </div>
                    <div className={`mnm-minicart-view-content-wrapper ${isVisible ? 'show' : 'hidden'}`}>
                        <div className={"mnm-minicart-view-content-container"}>

                        </div>
                        <div className={"mnm-minicart-view-footer-wrapper"}>
                            <div className={"variable-cart-footer-actions"}>
                                <a onClick={handleEditMiniCart} className={"mnm-edit-cart"}>{isEditable ? __('Cancel Edit','wc-mnm-variable') : __('Edit item(s)','wc-mnm-variable')}</a>
                                <a onClick={handleResetCart} className={"mnm-reset-cart"}>{__('Clear all ','wc-mnm-variable')}</a>
                            </div>
                            <p className={'mnm-minicart-quantity note'}>{__('Please add 0 items to complete.','wc-mnm-variable')}</p>
                            <p className={'mnm-minicart-price'}><span className={'mnm-minicart-price-label'}>{__('Total: ','wc-mnm-variable')}</span><span className={'mnm-minicart-total-price'}></span>(<span className={'mnm-cart-product-items'}>0</span>{__(' items','wc-mnm-variable')})</p>
                            <div className="woocommerce-variation-add-to-cart">
                                <div className="quantity">
                                    <label className="screen-reader-text" htmlFor="quantity_646dd169ab2b6">{productTitle} {__(' quantity','wc-mnm-variable')}</label>
                                    <input
                                        name="quantity"
                                        type="number"
                                        value={quantity}
                                        onChange={handleQuantityChange}
                                        min={minQuantity}
                                        max={maxQuantity}
                                        title='Qty'
                                        className="input-text qty text"
                                        inputMode="numeric"
                                        autoComplete="off"
                                    />
                                </div>
                                <button className="single_add_to_cart_button button alt wp-element-button wc-variation-selection-needed">{__('Add to Cart','wc-mnm-variable')}</button>
                            </div>
                        </div>
                        {<Loading />}
                    </div>
                </div>
            </div>
     </ContainerContext.Provider>

  )

}
