import { __ } from '@wordpress/i18n';
import { useEffect, useState } from '@wordpress/element';

/**
 * Internal dependencies
 */
import './style.scss';

//import { ChildItemsState } from './data/child-item-state';

import ChildItems from './ChildItems/ChildItems';
import ProductUnavailable from './ProductUnavailable.js';
import ContainerStatus from './StatusUI/ContainerStatus';
import { ContainerContext } from '../context/Context';

export default function MixAndMatch( {product} ) {

  const items = 'undefined' !== typeof product.extensions.mix_and_match && 'undefined' !== typeof product.extensions.mix_and_match.child_items ? product.extensions.mix_and_match.child_items : [];
  const Categories = 'undefined' !== typeof product.extensions.mix_and_match && 'undefined' !== typeof product.extensions.mix_and_match.child_categories ? product.extensions.mix_and_match.child_categories : [];
  const maxQuantity = 'undefined' !== typeof product.add_to_cart && 'undefined' !== typeof product.add_to_cart.maximum ? product.add_to_cart.maximum : 1;
  const minQuantity = 'undefined' !== typeof product.add_to_cart && 'undefined' !== typeof product.add_to_cart.minimum ? product.add_to_cart.minimum : 1;
  const productTitle = 'undefined' !== typeof product.name ? product.name : "";


  // Unavailable product (technically this would also be a place where the product ID is missing or not a mix and match, or some error).
  /*
  if (!product) {
    return <ProductUnavailable />;
  }
  */

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

  return (

    <ContainerContext.Provider value={product}>
        <ChildItems childItems={items} childCategories={Categories}/>
            <div className={"product-cart-overview mnm-variable-product-cart-view mnm-variable-product-cart-view-main"}>
                <div className={"product-cart-overview mnm-variable-product-cart-view-container"}>
                    <div className={"mnm-variable-cart-view-title-wrapper"}>
                        <h4>{__('Your Selection','wc-mnm-variable')}</h4>
                    </div>
                    <div className={"mnm-variable-cart-view-content-wrapper"}>
                        <div className={"mnm-variable-cart-view-content-container"}>

                        </div>
                    </div>
                    <div className={"mnm-variable-cart-view-footer-wrapper"}>
                        <div className={"variable-cart-footer-actions"}>
                            <a className={"mnm-edit-cart"}>{__('Edit item(s)','wc-mnm-variable')}</a>
                            <a className={"mnm-reset-cart"}>{__('Reset Cart','wc-mnm-variable')}</a>
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
                            <button className="single_add_to_cart_button button alt wp-element-button wc-variation-selection-needed">Add to Cart</button>
                        </div>
                    </div>
                </div>
            </div>
        <ContainerStatus />
     </ContainerContext.Provider>

  )

}
