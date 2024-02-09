/**
 * Internal dependencies
 */
import { useChild } from '@context';

import ProductImage from '../child-item/product-image';
import ProductDetails from '../child-item/product-details';
import ProductQty from '../child-item/product-qty';

const ChildItem = () => {
	const { childItem } = useChild();

	const { name, images, catalog_visibility, in_stock } = childItem;

	const firstImage = images.length ? images[ 0 ] : {};
	const permalink =
		catalog_visibility === 'hidden' || catalog_visibility === 'search'
			? false
			: childItem.permalink;

	return (

		<tr
			className={ `mnm_item child-item product type-product first post-${ childItem.child_id }` }
		>
			{ WC_MNM_ADD_TO_CART_VARIATION_PARAMS.display_thumbnails && (
				<td className="product-thumbnail">
					<ProductImage
						image={ firstImage }
						fallbackAlt={ name }
						permalink={ permalink }
					/>
				</td>
			) }
			<td className="product-details">
				<ProductDetails />
			</td>
			<td className="product-quantity">
				<ProductQty
					min={ childItem.min_qty }
					max={ childItem.max_qty }
					step={ childItem.step_qty }
				/>
			</td>
		</tr>
	);
};
export default ChildItem;
