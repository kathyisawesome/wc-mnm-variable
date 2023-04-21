/**
 * External dependencies
 */
import { decodeEntities } from '@wordpress/html-entities';
import { __ } from '@wordpress/i18n';
import { PLACEHOLDER_IMG_SRC } from '@woocommerce/settings';

const ProductImage = ( {
	image = {},
	fallbackAlt = '',
	loaded,
	showFullSize,
	permalink
} ) => {

	const imageProps = image.src
		? {
				src: image.src,
				alt:
					decodeEntities( image.alt ) ||
					fallbackAlt ||
					__( 'Product Image', 'woocommmerce-mix-and-match-products' ),
		  }
		: {
				src: PLACEHOLDER_IMG_SRC,
				alt: '',
		  };

	if ( permalink ) {
		return (
			<a href={ permalink } tabIndex={ -1 }>
				<img
					className="wc-block-components-product-image"
					{ ...imageProps }
					alt={ imageProps.alt }
				/>
			</a>
		)
	}

	
	
	return (
		<img
			className="wc-block-components-product-image {`wp-image-${image.id}`}"
			{ ...imageProps }
			alt={ imageProps.alt }
		/>
	);
};

export default ProductImage;
