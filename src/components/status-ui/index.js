import { useRef } from 'react';
import { __ } from '@wordpress/i18n';
import { useEffect, useState } from '@wordpress/element';

/**
 * Internal dependencies
 */
import './style.scss';

import ChildItems from './child-items/child-items';
import { ContainerContext } from '../context/context';
import Loading from "./loading";

import { CONFIG_STORE_KEY } from '../data';
import { useSelect } from '@wordpress/data';


export default function MixAndMatch( {product} ) {

    const config = useSelect( ( select ) => {
        return select( CONFIG_STORE_KEY ).getConfiguration();
    } );

    const configCount = config.length;


  const windowSize = useRef([window.innerWidth, window.innerHeight]);
  let [isVisible, setIsVisible] = useState(windowSize.current[0] > 600);
  const [isReset, setIsReset] = useState(false);
  const [containerKey, setContainerKey] = useState('');
  const items = 'undefined' !== typeof product.extensions.mix_and_match && 'undefined' !== typeof product.extensions.mix_and_match.child_items ? product.extensions.mix_and_match.child_items : [];
  const Categories = 'undefined' !== typeof product.extensions.mix_and_match && 'undefined' !== typeof product.extensions.mix_and_match.child_categories ? product.extensions.mix_and_match.child_categories : [];
  const ContainerMinSize = 'undefined' !== typeof product.extensions.mix_and_match && 'undefined' !== typeof product.extensions.mix_and_match.min_container_size ? product.extensions.mix_and_match.min_container_size : 1;
  const ContainerMaxSize = 'undefined' !== typeof product.extensions.mix_and_match && 'undefined' !== typeof product.extensions.mix_and_match.max_container_size ? product.extensions.mix_and_match.max_container_size : 1;
  const maxQuantity = 'undefined' !== typeof product.add_to_cart && 'undefined' !== typeof product.add_to_cart.maximum ? product.add_to_cart.maximum : 1;
  const minQuantity = 'undefined' !== typeof product.add_to_cart && 'undefined' !== typeof product.add_to_cart.minimum ? product.add_to_cart.minimum : 1;
  const productTitle = 'undefined' !== typeof product.name ? product.name : "";

  // No child items. Should add other results, like not purchasable?
  if ( ! items || items.length === 0 ) {
    return <p>{ __( 'No child items', 'woocommmerce-mix-and-match-products' ) }</p>
  }

  const [quantity, setQuantity] = useState(minQuantity);

  /**
   * Check the update cart parameters exists or not.
   *
   * @since 1.0.0
   */
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const getQuantity = params.get('quantity');
    if(params.get('update-container')){
        setContainerKey(params.get('update-container'));
    }
    if(getQuantity){
        setQuantity(getQuantity);
    }

  }, []);

  /**
   * Handle the Main quantity change event.
   *
   * @param event Get the event object.
   *
   * @since 1.0.0
   */
  const handleQuantityChange = (event) => {
    const value = Number(event.target.value);
    if (value >= minQuantity && value <= maxQuantity) {
      setQuantity(value);
    }
  };

  /**
   * Handle the minicart popup.
   *
   * @since 1.0.0
   */
  const handleMinicartPopup = () => {
      setIsVisible(!isVisible);
  }

  /**
   * Handle the Clear cart button event.
   *
   * @since 1.0.0
   */
  const handleResetCart = () => {
    setIsReset(true);
    setTimeout(function () {
        setIsReset(false);
    },500);
  };

    return (

    <ContainerContext.Provider value={product}>
        <div class="bacon">Bacon : {configCount}</div>
        <ChildItems childItems={items} childCategories={Categories} isReset={isReset}/>
            <div className={"mnm-minicart-overview mnm-variable-product-cart-view mnm-minicart-view-main"}>
                <div className={"product-minicart-overview mnm-minicart-view-container"}>
                    <div onClick={handleMinicartPopup} className={"mnm-minicart-view-title-wrapper"}>
                        <h4>{__('Your Selection','wc-mnm-variable')}</h4> <span className={`mnm-minicart-popup-icon dashicons dashicons-arrow-${isVisible ? 'down' : 'up'}-alt2`}></span>
                    </div>
                    <div className={`mnm-minicart-view-content-wrapper ${isVisible ? 'show' : 'hidden'}`}>
                        <div className={"mnm-minicart-view-content-container"}>

                        </div>
                        <div className={"mnm-minicart-view-footer-wrapper"}>
                            <div className={"variable-cart-footer-actions"}>
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
                                {containerKey ? <input type="hidden" name="update-container" value={containerKey} /> : ''}
                                <input type="hidden" name="mnm-min-container" value={ContainerMinSize} id="mnm_min_container" className="mnm-min-container"/>
                                <input type="hidden" name="mnm-max-container" value={ContainerMaxSize} id="mnm_max_container" className="mnm-max-container"/>
                                <button className="single_add_to_cart_button button alt wp-element-button wc-variation-selection-needed">{containerKey ? __('Update Cart','wc-mnm-variable') : __('Add to Cart','wc-mnm-variable')}</button>
                            </div>
                        </div>
                        {<Loading />}
                    </div>
                </div>
            </div>
     </ContainerContext.Provider>

  )

}
