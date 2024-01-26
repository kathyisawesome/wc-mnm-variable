/**
 * External dependencies
 */
import { useSelect } from '@wordpress/data';
import { Interweave } from 'interweave';

/**
 * Internal dependencies
 */
import { CONTAINER_STORE_KEY } from '@data/container';

const StatusUI = () => {
	const { maxContainerSize, subTotal, messages, totalQty, isValid } = useSelect( ( select ) => {
		return {
			maxContainerSize: select( CONTAINER_STORE_KEY ).getMaxContainerSize(),
			totalQty: select( CONTAINER_STORE_KEY ).getTotalQty(),
			subTotal: select( CONTAINER_STORE_KEY ).getSubTotal(),

			messages: select( CONTAINER_STORE_KEY ).isValid()
				? select( CONTAINER_STORE_KEY ).getMessages( 'status' )
				: select( CONTAINER_STORE_KEY ).getMessages( 'errors' ),
			isValid: select( CONTAINER_STORE_KEY ).isValid(),
		};
	} );

	let formattedTotal = 1 === maxContainerSize ? wc_mnm_params.i18n_quantity_format_counter_single : wc_mnm_params.i18n_quantity_format_counter;

	let max = maxContainerSize || _x(
		'∞',
		'[Frontend]',
		'wc-mnm-variable'
	);
		
	formattedTotal = formattedTotal.replace( '%max', max ).replace( '%s', totalQty );

	let formattedStatus = wc_mnm_params.i18n_status_format.replace( '%v', wc_mnm_price_format(subTotal) ).replace( '%s', formattedTotal );

	return (
		<div className={`mnm_status ${isValid ? 'passes_validation' : 'fails_validation'}`}>
			<p className="mnm_price">
				<span className="wc-mnm-block-child-item__product-price">
					<Interweave content={ formattedStatus } />
				</span>
			</p>

			<div
				aria-live="polite"
				role="status"
				className={ `mnm_message woocommerce-message ${ ! isValid ? 'woocommerce-error' : '' }` }
				style={ { display: 'block' } }
			>
				<ul className="msg mnm_message_content">
					{ messages.map( ( message, index ) => (
						<li key={ index }>{ message }</li>
					) ) }
				</ul>
			</div>
		</div>
	);
};

export default StatusUI;
