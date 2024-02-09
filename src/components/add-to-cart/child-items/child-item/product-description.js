import { Interweave } from 'interweave';

const ProductDescription = ( { shortDescription } ) => {
	return (
		<div className="wc-mnm-block-child-item__product-description">
			<Interweave tagName="p" content={ shortDescription } />
		</div>
	);
};
export default ProductDescription;
