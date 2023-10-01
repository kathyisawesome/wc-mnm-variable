/**
 * External dependencies
 */
import { _x } from '@wordpress/i18n';

/**
 * Internal dependencies
 */
import ChildItem from './child-item';
import { ChildProvider } from '@context';

const ChildItems = ( { childItems, childCategories, isReset } ) => {
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

	const getItems = ( childProducts ) => {
		return displayLayout === 'grid' ? (
			<div className="grid">
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
								'woo-gutenberg-products-block'
							) }
						</th>
						<th>
							{ _x(
								'Quantity',
								'[Frontend]',
								'woo-gutenberg-products-block'
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

		return Object.entries( categories ).map(
			( [ categoryId, categoryName ] ) => {
				displayItems = [];

				return (
					<div
						key={ categoryId }
						className={ `product-category product-category-${ categoryName }` }
					>
						<h2 className="woocommerce-loop-category_xtitle">
							{ categoryName }
						</h2>
						{ childItems.map( ( childItem, index ) => {
							if (
								childItem.category_ids.some(
									( item ) =>
										Number( item ) === Number( categoryId )
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
									? getItems( displayItems )
									: '';
							}
						} ) }
					</div>
				);
			}
		);
	};

	return (
		<div
			className={ `mnm-variable-product mnm_child_products wc-block-${ displayLayout } has-${ numColumns }-columns ${ hasRows } ${ mobile_optimized }` }
		>
			{ childCategories.length
				? getCategoryItems( childCategories, childItems )
				: getItems( childItems ) }
		</div>
	);
};
export default ChildItems;
