/**
 * Internal dependencies
 */
import { default as GridItems } from './grid/child-items';
import { default as TabularItems } from './tabular/child-items';

const ChildItems = ( { childItems, childCategories } ) => {
	const displayLayout = WC_MNM_ADD_TO_CART_VARIATION_PARAMS.display_layout;
	const mobile_optimized =
	WC_MNM_ADD_TO_CART_VARIATION_PARAMS.mobile_optimized_layout
		? 'mnm-mobile-optimized'
		: '';

	const getItems = ( childItems, categoryId ) => {

		return displayLayout === 'grid' ? (
			<GridItems childItems={childItems} key={categoryId || 0} />
		) : (
			<TabularItems childItems={childItems} key={categoryId || 0} />
		);
	};

	const getCategoryItems = ( categories, childItems ) => {
		let displayItems = [];
		let displayedItems = [];

		return categories.map(
			( category ) => {
				displayItems = [];

				return (
					<div
						key={ category.term_id }
						className={ `wc-mnm-variation__child-category product-category product-category-${ category.name.toLowerCase() }` }
					>
						<h3 className="wc-mnm-variation__category-title woocommerce-loop-category_xtitle">
							{ category.name }
						</h3>
						{ childItems.map( ( childItem, index ) => {
							if (
								childItem.category_ids.some(
									( item ) =>
										Number( item ) === Number( category.term_id )
								) &&
								( displayedItems.length === 0 ||
									! displayedItems.some(
										( item ) =>
											item.child_id === childItem.child_id
									) )
							) {
								displayItems.push( childItem );
							}
							if ( index + 1 === childItems.length ) {
								displayedItems = displayedItems.length
									? [
											...displayItems,
											...displayedItems.filter(
												( item ) =>
													! displayItems.some(
														( displayItem ) =>
															displayItem.child_id ===
															item.child_id
													)
											),
									  ]
									: displayItems;
								return displayItems.length
									? getItems( displayItems, category.term_id )
									: '';
							}
						} ) }
					</div>
				);
			} )
		};

	return (
		<div
			className={ `wc-mnm-variation__child-items-wrap ${mobile_optimized}` }
		>
			{ Object.keys( childCategories ).length
				? getCategoryItems( childCategories, childItems )
				: getItems( childItems ) }
		</div>
	);
};
export default ChildItems;
