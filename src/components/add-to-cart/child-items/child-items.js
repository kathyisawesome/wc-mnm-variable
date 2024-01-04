/**
 * External dependencies
 */
import { _x } from '@wordpress/i18n';

/**
 * Internal dependencies
 */
import ChildItem from './child-item';
import { ChildProvider } from '@context';

const ChildItems = ( { childItems, childCategories } ) => {
	const numColumns = WC_MNM_ADD_TO_CART_REACT_PARAMS.num_columns;
	const displayLayout = WC_MNM_ADD_TO_CART_REACT_PARAMS.display_layout;
	const hasRows = childItems.length > numColumns ? 'has-multilpe-rows' : '';
	const mobile_optimized =
		WC_MNM_ADD_TO_CART_REACT_PARAMS.mobile_optimized_layout
			? 'mnm-mobile-optimized'
			: '';

	/**
	 * Temporary fix to get first|last grid classes.
	 *
	 * @param index
	 */
	const generateLoopClass = ( index ) => {
		if ( index % numColumns === 0 || numColumns === 1 ) {
			return 'first';
		}

		if ( ( index + 1 ) % numColumns === 0 ) {
			return 'last';
		}

		return '';
	};

	const getItems = ( childProducts, categoryId ) => {

		return displayLayout === 'grid' ? (
			<div className="grid" key={categoryId || 0} >
				<ul
					className={ `products mnm_child_products grid has-flex columns-${ numColumns }` }
				>
					{ childProducts.map( ( childItem, index ) => {
						return (
							<ChildProvider
								key={ childItem.child_id }
								childItem={ { childItem } }
							>
								<ChildItem
									loopClass={ generateLoopClass( index ) }
								/>
							</ChildProvider>
						);
					} ) }
				</ul>
			</div>
		) : (
			<table
				key={categoryId || 0}
				cellSpacing="0"
				className="products mnm_child_products tabular mnm_table shop_table"
			>
				<thead>
					<tr>
						<th> </th>
						<th>
							{ _x(
								'Product',
								'[Frontend]',
								'wc-mnm-variable'
							) }
						</th>
						<th>
							{ _x(
								'Quantity',
								'[Frontend]',
								'wc-mnm-variable'
							) }
						</th>
					</tr>
				</thead>
				<tbody>
					{ childProducts.map( ( childItem, index ) => (
						<ChildProvider
							key={ childItem.child_id }
							childItem={ { childItem } }
						>
							<ChildItem />
						</ChildProvider>
					) ) }
				</tbody>
			</table>
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
			className={ `mnm-variable-product mnm_child_products wc-block-${ displayLayout } has-${ numColumns }-columns ${ hasRows } ${ mobile_optimized }` }
		>
			{ Object.keys( childCategories ).length
				? getCategoryItems( childCategories, childItems )
				: getItems( childItems ) }
		</div>
	);
};
export default ChildItems;
