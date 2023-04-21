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

    return (      

        <div className='wc-block-grid has-3-columns has-multiple-rows'>

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