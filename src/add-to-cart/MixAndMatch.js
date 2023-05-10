import { __ } from '@wordpress/i18n';
import { useEffect, useState } from '@wordpress/element';

/**
 * Internal dependencies
 */
import './style.scss';

//import { ChildItemsState } from './data/child-item-state';

import ChildItems from './ChildItems/ChildItems';
import ProductUnavailable from './ProductUnavailable.js';
import Status from './StatusUI/StatusUI';
import { ContainerContext } from '../context/Context';

export default function MixAndMatch( {product} ) {

  // Unavailable product (technically this would also be a place where the product ID is missing or not a mix and match, or some error).
  /*
  if (!product) {
    return <ProductUnavailable />;
  }
  */

  // No child items. Should add other results, like not purchasable?
  if( ! product.mnm_child_items || product.mnm_child_items.length === 0 ) {
    return <p>{ __( 'No child items', 'woocommmerce-mix-and-match-products' ) }</p>
  }
 
  return (

    <ContainerContext.Provider value={product}>
      <div className="products mnm_child_products" >
          <ChildItems childItems={product.mnm_child_items} />
      </div>                
     </ContainerContext.Provider>

  )

}


/*
      <ContainerContext.Provider value={product} className="App">
        <h1>Has {childItems.length} children</h1>
        <ChildItems childItems={childItems} />
        <Status container={product} />
      </ContainerContext.Provider>
      */