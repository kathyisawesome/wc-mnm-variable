import { _x } from '@wordpress/i18n';
import { useDispatch, useSelect } from '@wordpress/data';

/**
 * Internal dependencies
 */
import { CONTAINER_STORE_KEY } from '@data';

const Reset = () => {
	// Get the child Items from the data store.
	const { totalQty } = useSelect( ( select ) => {
		return {
			totalQty: select( CONTAINER_STORE_KEY ).getTotalQty(),
		};
	} );

	const dispatch = useDispatch();

	const handleReset = () => {
		if ( window.confirm( WC_MNM_ADD_TO_CART_VARIATION_PARAMS.i18n_confirm_reset ) ) {
			dispatch( CONTAINER_STORE_KEY ).resetConfig();
		}
	};

	if ( totalQty ) {
		return (
			<button
				type="button"
				className="mnm_reset button wp-element-button"
				onClick={ handleReset }
			>
				{ _x(
					'Clear selections',
					'[Frontend]',
					'wc-mnm-variable'
				) }
			</button>
		);
	}
};

export default Reset;
