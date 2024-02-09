/**
 * External dependencies
 */
import { _x } from '@wordpress/i18n';

/**
 * Internal dependencies
 */
import { default as ChildItem } from './child-item';
import { ChildProvider } from '@context';
import { generateLoopClass } from './utils';

const ChildItems = ( { childItems } ) => {
	const numColumns = WC_MNM_ADD_TO_CART_VARIATION_PARAMS.num_columns;
	const hasRows = childItems.length > numColumns ? 'has-multilpe-rows' : '';
	const mobile_optimized =
		WC_MNM_ADD_TO_CART_VARIATION_PARAMS.mobile_optimized_layout
			? 'mnm-mobile-optimized'
			: '';

	return (
		<div className={ `grid has-${ numColumns }-columns ${ hasRows } ${ mobile_optimized }` } >
			<ul
				className={ `products mnm_child_products grid has-flex columns-${ numColumns }` }
			>
				{ childItems.map( ( childItem, index ) => {
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

	);
};
export default ChildItems;

