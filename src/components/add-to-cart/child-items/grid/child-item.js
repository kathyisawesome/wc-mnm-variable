/**
 * Internal dependencies
 */
import { useChild } from '@context';

import ProductImage from '../child-item/product-image';
import ProductDetails from '../child-item/product-details';
import ProductQty from '../child-item/product-qty';

const ChildItem = ( { loopClass } ) => {
	const { childItem } = useChild();

	const { name, images, catalog_visibility, in_stock } = childItem;

	const firstImage = images.length ? images[ 0 ] : {};
	const permalink =
		catalog_visibility === 'hidden' || catalog_visibility === 'search'
			? false
			: childItem.permalink;

	return (
		<li
			className={ `type-product child-item wc-mnm-child-item product ${ loopClass } ${ in_stock ? 'instock' : 'outofstock' }` }
		>
			{ WC_MNM_ADD_TO_CART_VARIATION_PARAMS.display_thumbnails && (
				<ProductImage
					image={ firstImage }
					fallbackAlt={ name }
					permalink={ permalink }
				/>
			) }
			<ProductDetails />
			<ProductQty
				min={ childItem.min_qty }
				max={ childItem.max_qty }
				step={ childItem.step_qty }
			/>
		</li>

	);
};
export default ChildItem;
