/**
 * External dependencies
 */
import { createContext, useContext } from '@wordpress/element';

/**
 * WooCommerce dependencies
 */
//      <ProductImage product={product} />
//import { ProductImage } from '@woocommerce/components';

/**
 * Internal dependencies
 */
import ChildItem from './ChildItem/ChildItem';
import { ConfigContext, ChildContext } from '../../context/Context';

function ChildItems( {childItems} ) {

    
    const config = useContext(ConfigContext);

    const num_columns = WC_MNM_ADD_TO_CART_REACT_PARAMS.num_columns;
    const has_rows = childItems.length > num_columns ? 'has-multilpe-rows' : ''

    return (      

        <div className={`products mnm_child_products wc-block-grid has-${num_columns}-columns ${has_rows}`}>

            <ul className="wc-block-grid__products">

                { 
                    childItems.map((childItem, index) => (
                        <ChildContext.Provider key={childItem.child_id} value={childItem}>
                            <ChildItem />
                        </ChildContext.Provider>
                    ) )
                }

            </ul>
        </div>
        
    )
    
}
export default ChildItems