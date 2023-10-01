/**
 * External dependencies
 */
import { _x } from '@wordpress/i18n';

const ProductUnavailable = ( {
	reason = _x(
		'Sorry, this product cannot be purchased.',
		'[Frontend]',
		'woo-gutenberg-products-block'
	),
} ) => {
	return (
		<div className="wc-block-components-product-add-to-cart-unavailable">
			{ reason }
		</div>
	);
};

export default ProductUnavailable;