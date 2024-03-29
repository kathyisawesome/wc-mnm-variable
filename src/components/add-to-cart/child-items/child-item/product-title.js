import { Interweave } from 'interweave';

const ProductTitle = ( { title } ) => {
	const titleClass =
		WC_MNM_ADD_TO_CART_VARIATION_PARAMS.display_layout === 'grid'
			? 'wc-block-grid__product-title'
			: 'woocommerce-loop-product__title';
	return (
		<h4 className={ 'wc-mnm-variation__child-item-title ' + titleClass }>
			<Interweave content={ title } />
		</h4>
	);
};
export default ProductTitle;
