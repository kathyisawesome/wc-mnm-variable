import { Interweave } from 'interweave';

function ProductDescription( {shortDescription} ) {

    return (

        <div className='wc-mnm-block-child-item__product-description' >
            <Interweave content={shortDescription} />
        </div>       
        
    )
    
}
export default ProductDescription;