/**
 * External dependencies
 */
import { _x } from '@wordpress/i18n';

/**
 * Internal dependencies
 */
import { default as ChildItem } from './child-item';
import { ChildProvider } from '@context';

const ChildItems = ( { childItems } ) => {

	return (
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
				{ childItems.map( ( childItem, index ) => (
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
export default ChildItems;
