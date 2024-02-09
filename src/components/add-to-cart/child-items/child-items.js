/**
 * Internal dependencies
 */
import { default as GridItems } from './grid/child-items';
import { default as TabularItems } from './tabular/child-items';

const ChildItems = ( { childItems, childCategories } ) => {
	const displayLayout = WC_MNM_ADD_TO_CART_VARIATION_PARAMS.display_layout;

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
						className={ `product-category product-category-${ category.name }` }
					>
						<h3 className="woocommerce-loop-category_xtitle">
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
			className={ `mnm-variable-product mnm_child_products wc-block-${ displayLayout }` }
		>
			{ Object.keys( childCategories ).length
				? getCategoryItems( childCategories, childItems )
				: getItems( childItems ) }
		</div>
	);
};
export default ChildItems;
