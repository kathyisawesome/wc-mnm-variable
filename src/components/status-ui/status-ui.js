/**
 * External dependencies
 */
import { useSelect } from '@wordpress/data';

/**
 * Internal dependencies
 */
import { CONTAINER_STORE_KEY } from '@data/container';

const StatusUI = () => {
	const { messages, totalQty, isValid } = useSelect( ( select ) => {
		return {
			hasChildItems: select( CONTAINER_STORE_KEY ).hasChildItems(),
			messages: select( CONTAINER_STORE_KEY ).isValid()
				? select( CONTAINER_STORE_KEY ).getMessages( 'status' )
				: select( CONTAINER_STORE_KEY ).getMessages( 'errors' ),
			isValid: select( CONTAINER_STORE_KEY ).isValid(),
		};
	} );

	const errorClass = ! isValid ? 'woocommerce-error' : '';

	return (
		<div className="mnm_status">
			<div
				aria-live="polite"
				role="status"
				className={ `mnm_message woocommerce-message ${ errorClass }` }
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
