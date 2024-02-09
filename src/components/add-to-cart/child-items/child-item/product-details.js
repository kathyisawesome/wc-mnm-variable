/**
 * External dependencies
 */
import { useSelect } from '@wordpress/data';

/**
 * Internal dependencies
 */
import { useChild } from '@context';
import { CONTAINER_STORE_KEY } from '@data';
import ProductTitle from './product-title';
import ProductDescription from './product-description';
import ProductStockStatus from './product-stock-status';
import ProductPrice from './product-price';

const ProductDetails = () => {
	const { container, isInStock } = useSelect( ( select ) => {
		return {
			container: select( CONTAINER_STORE_KEY ).getContainer(),
			isInStock: select( CONTAINER_STORE_KEY ).isInStock(),
		};
	} );

	const { childItem } = useChild();

	const {
		name,
		catalog_visibility,
		permalink,
		short_description,
		price_html,
	} = childItem;

	const isProductHiddenFromCatalog =
		catalog_visibility === 'hidden' || catalog_visibility === 'search'; // @todo: Need a way to toggle this off in admin.

	const isSelectable = isInStock && childItem.purchasable && childItem.in_stock;

	return (
		<div className="wc-mnm-block-child-item__product-details">
			{ isProductHiddenFromCatalog ? (
				<ProductTitle title={ name } />
			) : (
				<a href={ permalink } tabIndex={ -1 }>
					<ProductTitle title={ name } />
				</a>
			) }

			{ WC_MNM_ADD_TO_CART_VARIATION_PARAMS.display_short_description && (
				<ProductDescription shortDescription={ short_description } />
			) }

			{ isSelectable && (
				<ProductStockStatus
					status={ childItem.availability.class }
					availability={ childItem.availability.availability }
				/>
			) }

			{ container.priced_per_product && (
				<ProductPrice priceString={ price_html } />
			) }
		</div>
	);
};
export default ProductDetails;
