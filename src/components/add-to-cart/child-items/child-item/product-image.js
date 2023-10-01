/**
 * External dependencies
 */
import { decodeEntities } from '@wordpress/html-entities';
import { _x } from '@wordpress/i18n';
import { PLACEHOLDER_IMG_SRC } from '@woocommerce/settings';

const ProductImage = ( {
	image = {},
	fallbackAlt = '',
	loaded,
	showFullSize,
	permalink,
} ) => {
	const imageSrc = image.src ? image.src : PLACEHOLDER_IMG_SRC;

	const imageProps = image.src
		? {
				src: image.src,
				alt:
					decodeEntities( image.alt ) ||
					fallbackAlt ||
					_x(
						'Product Image',
						'[Frontend]',
						'woo-gutenberg-products-block'
					),
				className:
					'attachment-woocommerce_thumbnail size-woocommerce_thumbnail',
				'data-large_image': imageSrc,
				loading: 'lazy',
		  }
		: {
				src: PLACEHOLDER_IMG_SRC,
				alt: '',
		  };

	if ( permalink ) {
		return (
			<div className="mnm_child_product_images mnm_image">
				<figure className="mnm_child_product_image woocommerce-product-gallery__image">
					<a
						href={ imageSrc }
						className="image zoom"
						data-rel="photoSwipe"
					>
						<img
							className="wc-block-components-product-image"
							{ ...imageProps }
							alt={ imageProps.alt }
						/>
					</a>
				</figure>
			</div>
		);
	}

	return (
		<div className="mnm_child_product_images mnm_image">
			<figure className="mnm_child_product_image woocommerce-product-gallery__image">
				<a
					href={ imageSrc }
					className="image zoom"
					data-rel="photoSwipe"
				>
					<img
						className="wc-block-components-product-image {`wp-image-${image.id}`}"
						{ ...imageProps }
						alt={ imageProps.alt }
					/>
				</a>
			</figure>
		</div>
	);
};

export default ProductImage;
