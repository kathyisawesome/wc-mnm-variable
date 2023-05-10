/**
 * External dependencies
 */
import { useEffect, useState, useContext } from '@wordpress/element';

/**
 * Internal dependencies
 */
//import './style.scss';
import { ChildContext } from '../../../context/Context';

import ProductImage from './ProductImage';
import ProductDetails from './ProductDetails';
import ProductQty from './ProductQty';

function ChildItem() {

    const childItem = useContext(ChildContext);

    const [quantity, setQuantity] = useState(0);

    const { name, images, catalog_visibility, purchasable } = childItem;

    const firstImage = images.length ? images[ 0 ] : {};

	const permalink = catalog_visibility === 'hidden' || catalog_visibility === 'search' ? false : childItem.permalink;

    const handleQuantityChange = (value) => {
        setQuantity(value);
    };

    // Fetch the inital product on page load.
    useEffect(() => {
        const initialQty = childItem.qty || 0;
        setQuantity(initialQty);
    }, [] );

    return (      

            <li key={childItem.child_id} className="wc-block-grid__product wc-block-layout wc-mnm-child-item">

                { WC_MNM_ADD_TO_CART_REACT_PARAMS.display_thumbnails && (

                    <ProductImage image={ firstImage } fallbackAlt={ name } permalink={permalink} />
            
                ) }

                <ProductDetails />

                <ProductQty min={childItem.min_qty} max={childItem.max_qty} step={childItem.step_qty} value={quantity} onChange={handleQuantityChange} />

            </li>   
        
    )
    
}
export default ChildItem