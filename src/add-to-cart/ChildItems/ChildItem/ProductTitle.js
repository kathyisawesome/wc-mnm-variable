import { Interweave } from 'interweave';

function ProductTitle( {title} ) {
    const titleClass = WC_MNM_ADD_TO_CART_REACT_PARAMS.display_layout === 'grid' ? 'wc-block-grid__product-title' : 'woocommerce-loop-product__title';
    return (
        <h4 className={'wc-block-components-product-title ' + titleClass}>
            <Interweave content={title} />
        </h4>
    )

}
export default ProductTitle
