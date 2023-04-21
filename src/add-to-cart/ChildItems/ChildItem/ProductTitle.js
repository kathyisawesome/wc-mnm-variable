import { Interweave } from 'interweave';

function ProductTitle( {title} ) {

    return (
        <h4 className='wc-block-components-product-title wc-block-grid__product-title'>
            <Interweave content={title} />
        </h4>
    )

}
export default ProductTitle
