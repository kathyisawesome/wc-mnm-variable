import { Interweave } from 'interweave';

function ProductStockStatus( {status, availability} ) {

    return (
        <p className={`wc-mnm-block-child-item__product-stock stock ${status}`}>
            <Interweave content={availability} />
        </p>
    )
    
}
export default ProductStockStatus;