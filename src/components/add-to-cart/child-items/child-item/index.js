/**
 * External dependencies
 */
import { useEffect, useState, useContext } from '@wordpress/element';

/**
 * Internal dependencies
 */
//import './style.scss';
import { ChildContext } from '../../../../context';

import ProductImage from './product-image';
import ProductDetails from './product-details';
import ProductQty from './product-qty';

const ChildItem = () => {

    const {childItem,isReset} = useContext(ChildContext);
    const params = new URLSearchParams(window.location.search);

    const [quantity, setQuantity] = useState(0);
    const [isQuantity, setIsQuantity] = useState(false);

    const { name, images, catalog_visibility, purchasable } = childItem;

    const firstImage = images.length ? images[ 0 ] : {};

	const permalink = catalog_visibility === 'hidden' || catalog_visibility === 'search' ? false : childItem.permalink;
    const isGridLayout = WC_MNM_ADD_TO_CART_REACT_PARAMS.display_layout === 'grid';

    /**
     * Handle the child product quantity change event.
     *
     * @param value Get the item quantity.
     * @param isQtyReset product reset or not.
     *
     * @since 1.0.0
     */
    const handleQuantityChange = (value, isQtyReset = false) => {
        setQuantity(value);
        if(isQtyReset){
            setTimeout( function (){
                setIsQuantity(false);
            },500);
        }
    };

    /**
     * Fetch the initial product on page load.
     *
     * @since 1.0.0
     */
    useEffect(() => {
        let initialQty = childItem.qty || 0;
        setQuantity(initialQty);
        if( params.get(`mnm_quantity[${childItem.child_id}]`) && isQuantity !== 0){
            setIsQuantity(true);
        }
    }, [] );

    /**
     * Handle Clear all button event in child product.
     *
     * @since 1.0.0
     */
    if(isReset && quantity !== 0 && ( ! isQuantity || ( params.get(`mnm_quantity[${childItem.child_id}]`) && quantity !== params.get(`mnm_quantity[${childItem.child_id}]`) ) ) ){
        if( isQuantity ) {
            handleQuantityChange(params.get(`mnm_quantity[${childItem.child_id}]`), true);
        }else{
            setQuantity(0);
        }
    }

    return (
        isGridLayout ? (
            <li className="wc-block-grid__product wc-block-layout wc-mnm-child-item">
                { WC_MNM_ADD_TO_CART_REACT_PARAMS.display_thumbnails && (
                    <ProductImage image={ firstImage } fallbackAlt={ name } permalink={permalink} />
                ) }
                <ProductDetails />
                <ProductQty min={childItem.min_qty} max={childItem.max_qty} step={childItem.step_qty} value={quantity} onChange={handleQuantityChange} />
            </li>
            ) : (
                <tr className={`mnm_item child-item product type-product first post-${childItem.child_id}`}>
                    { WC_MNM_ADD_TO_CART_REACT_PARAMS.display_thumbnails && (
                        <td className='product-thumbnail'>
                            <ProductImage image={ firstImage } fallbackAlt={ name } permalink={permalink} />
                        </td>
                    ) }
                    <td className="product-details">
                        <ProductDetails />
                    </td>
                    <td className="product-quantity">
                        <ProductQty min={childItem.min_qty} max={childItem.max_qty} step={childItem.step_qty} value={quantity} onChange={handleQuantityChange} />
                    </td>
                </tr>
        )
    )
    
}
export default ChildItem