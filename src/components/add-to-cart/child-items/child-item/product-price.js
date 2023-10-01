import { Interweave } from 'interweave';

const ProductPrice = ( { priceString } ) => {
	return (
		<div className="wc-mnm-block-child-item__product-price">
			<Interweave content={ priceString } />
		</div>
	);
};
export default ProductPrice;
