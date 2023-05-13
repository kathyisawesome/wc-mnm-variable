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
 
  return (

    <ContainerContext.Provider value={product}>
          <ChildItems childItems={items} />
          <ContainerStatus />           
     </ContainerContext.Provider>

  )

}
