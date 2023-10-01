/**
 * Internal dependencies
 */
import { useChild } from '@context';

import ProductImage from './product-image';
import ProductDetails from './product-details';
import ProductQty from './product-qty';

const ChildItem = ( { loopClass } ) => {
	const { childItem } = useChild();
	const { name, images, catalog_visibility, purchasable } = childItem;

	const firstImage = images.length ? images[ 0 ] : {};
	const permalink =
		catalog_visibility === 'hidden' || catalog_visibility === 'search'
			? false
			: childItem.permalink;
	const isGridLayout =
		WC_MNM_ADD_TO_CART_REACT_PARAMS.display_layout === 'grid';

	return isGridLayout ? (
		<li
			className={ `type-product wc-mnm-child-item product ${ loopClass }` }
		>
			{ WC_MNM_ADD_TO_CART_REACT_PARAMS.display_thumbnails && (
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
	) : (
		<tr
			className={ `mnm_item child-item product type-product first post-${ childItem.child_id }` }
		>
			{ WC_MNM_ADD_TO_CART_REACT_PARAMS.display_thumbnails && (
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
