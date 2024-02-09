/**
 * External dependencies
 */
import { _x } from '@wordpress/i18n';
import { useSelect } from '@wordpress/data';
import { Interweave } from 'interweave';

/**
 * Internal dependencies
 */
import { CONTAINER_STORE_KEY } from '@data/container';

const StatusUI = () => {
	const { messages, passesValidation, formattedStatus } = useSelect( ( select ) => {
		return {
			messages: select( CONTAINER_STORE_KEY ).passesValidation()
				? select( CONTAINER_STORE_KEY ).getMessages( 'status' )
				: select( CONTAINER_STORE_KEY ).getMessages( 'errors' ),
			passesValidation: select( CONTAINER_STORE_KEY ).passesValidation(),
			formattedStatus: select( CONTAINER_STORE_KEY ).getFormattedStatus(),
		};
	} );

	return (
		<div className={`mnm_status ${passesValidation ? 'passes_validation' : 'fails_validation'}`}>
			<p className="mnm_price">
				<span className="wc-mnm-block-child-item__product-price">
					<Interweave content={ formattedStatus } />
				</span>
			</p>

			<div
				aria-live="polite"
				role="status"
				className={ `mnm_message woocommerce-message ${ ! passesValidation ? 'woocommerce-error' : '' }` }
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
