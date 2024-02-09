/**
 * Internal dependencies
 */
import { useChild } from '@context';


import { default as GridItem } from '.././grid/child-item';
import { default as TabularItem } from '.././tabular/child-item';


const ChildItem = ( { loopClass } ) => {
	const { childItem } = useChild();

	const { name, images, catalog_visibility, stock_status } = childItem;

	const firstImage = images.length ? images[ 0 ] : {};
	const permalink =
		catalog_visibility === 'hidden' || catalog_visibility === 'search'
			? false
			: childItem.permalink;
	const isGridLayout =
		WC_MNM_ADD_TO_CART_VARIATION_PARAMS.display_layout === 'grid';

	return isGridLayout ? (
		<GridItem childItem={childItem} />
	) : (
		<TabularItem childItem={childItem} />
	);
};
export default ChildItem;
