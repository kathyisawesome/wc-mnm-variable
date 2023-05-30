/**
 * External dependencies
 */
import { __ } from '@wordpress/i18n';

const Loading = () => {
	return (
		<div className="wc-block-components-product-add-to-cart-loading blockUI blockOverlay mnm-hidden">
			{ __(
				'Loading...',
				'wc-mnm-reactified'
			) }
		</div>
	);
};

export default Loading;
