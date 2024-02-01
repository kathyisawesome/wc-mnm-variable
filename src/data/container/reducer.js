/**
 * External dependencies
 */
import { _x } from '@wordpress/i18n';

/**
 * Internal dependencies
 */
import DEFAULT_STATE from './default-state';
import TYPES from './action-types';

const { SET_CONTAINER_ID, HYDRATE_CONTAINER, RESET_CONFIG, SET_CONTEXT, SET_CONFIG, UPDATE_QTY, VALIDATE } =
	TYPES;

/**
 * Calculate the total quantity given any config of ID=>quantity pairs.
 *
 * @param obj    config {
 *               98 => 1,
 *               99 => 2,
 *               }
 * @param config
 */
const calcTotalQty = ( config ) => {
	return Object.values( config ).reduce(
		( total, qty ) => total + Number( qty ),
		0
	);
};

/**
 * Quantity total message builder.
 *
 * @param int qty
 * @param qty
 */
const selectedQtyMessage = function ( qty ) {
	const message =
		qty === 1
			? wc_mnm_params.i18n_qty_message_single
			: wc_mnm_params.i18n_qty_message;
	return message.replace( '%s', qty );
};

/**
 * Data store reducer
 *
 * @param object state
 * @param object payload
 * @return object the updated state
 */

const reducer = ( state = DEFAULT_STATE, { type, payload } ) => {
	switch ( type ) {

		case SET_CONTAINER_ID:
      		return {
				...state,
				containerId: payload.containerId
			};

		case HYDRATE_CONTAINER: {

			const params = new URLSearchParams( window.location.search );
			const context = params.get( 'update-container' ) || 'edit' === params.get( 'action' ) ? 'edit' : 'add-to-cart'; // @todo - How can we set this context in the component itself.

			return {
				...state,
				containers: {
					...state.containers,
					[payload.container.id]: payload.container,
				  },
		//		context: context,
			};
		}

		case RESET_CONFIG:
			return {
				...state,
				config: {},
				selections: [],
			};

		case SET_CONTEXT:
			return {
				...state,
				context: payload.context,
			};

		case SET_CONFIG:

			const updatedConfig = payload.config;

			return {
				...state,
				config: updatedConfig,
				//selections: updatedSelections, // @todo - need to figure this out somehow.
			};

		case UPDATE_QTY:
			const child_id = payload.item.child_id;
			const currentQty = state.config.hasOwnProperty( child_id )
				? state.config[ child_id ]
				: 0;
			const updatedSelections = state.selections;

			// If increasing.
			if ( payload.qty > currentQty ) {
				updatedSelections.push( payload.item );
			} else if ( payload.qty < currentQty ) {
				// if decreasing this needs to remove the last instance of this item.
				for ( let i = updatedSelections.length - 1; i >= 0; i-- ) {
					if ( updatedSelections[ i ].child_id === child_id ) {
						const newLocal = 1;
						updatedSelections.splice( i, newLocal );
						break; // Stop the loop after removing the last matching object.
					}
				}
			}

			const qtyConfig = {
				...state.config,
				[ child_id ]: payload.qty,
			};

			return {
				...state,
				config: qtyConfig,
				selections: updatedSelections,
			};

		case VALIDATE:
		
			const messages = {
				status: [],
				errors: [],
			};
			const totalQty = calcTotalQty( state.config );

			if (
				state.containers.hasOwnProperty( state.containerId ) &&
				state.containers[state.containerId].hasOwnProperty('type') &&
				state.containers[state.containerId].type === 'mix-and-match-variation'
			) {
				const validationContext = state.context;

				const minContainerSize =
					state.containers[state.containerId].extensions.mix_and_match.min_container_size;
				const maxContainerSize =
					state.containers[state.containerId].extensions.mix_and_match.max_container_size;
				const qtyMessage = selectedQtyMessage( totalQty ); // "Selected X total".
				
				let errorMessage = '';
				let validMessage = '';

				// Validation.
				switch ( true ) {
					// Validate a fixed size container.
					case minContainerSize === maxContainerSize:
						validMessage =
							typeof wc_mnm_params[
								'i18n_' +
									validationContext +
									'_valid_fixed_message'
							] !== 'undefined'
								? wc_mnm_params[
										'i18n_' +
											validationContext +
											'_valid_fixed_message'
								  ]
								: wc_mnm_params.i18n_valid_fixed_message;

						if ( totalQty !== minContainerSize ) {
							errorMessage =
								minContainerSize === 1
									? wc_mnm_params.i18n_qty_error_single
									: wc_mnm_params.i18n_qty_error;
							errorMessage = errorMessage.replace(
								'%s',
								minContainerSize
							);
							messages.errors.push(
								errorMessage.replace( '%v', qtyMessage )
							);
						}

						break;

					// Validate that a container has fewer than the maximum number of items.
					case maxContainerSize > 0 && minContainerSize === 0:
						validMessage =
							typeof wc_mnm_params[
								'i18n_' +
									validationContext +
									'_valid_max_message'
							] !== 'undefined'
								? wc_mnm_params[
										'i18n_' +
											validationContext +
											'_valid_max_message'
								  ]
								: wc_mnm_params.i18n_valid_max_message;

						if ( totalQty > maxContainerSize ) {
							errorMessage =
								maxContainerSize > 1
									? wc_mnm_params.i18n_max_qty_error
									: wc_mnm_params.i18n_max_qty_error_singular;
							errorMessage = errorMessage
								.replace( '%max', maxContainerSize )
								.replace( '%v', qtyMessage );
							messages.errors.push( errorMessage );
						}

						break;

					// Validate a range.
					case maxContainerSize > 0 && minContainerSize > 0:
						validMessage =
							typeof wc_mnm_params[
								'i18n_' +
									validationContext +
									'_valid_range_message'
							] !== 'undefined'
								? wc_mnm_params[
										'i18n_' +
											validationContext +
											'_valid_range_message'
								  ]
								: wc_mnm_params.i18n_valid_range_message;

						if (
							totalQty < minContainerSize ||
							totalQty > maxContainerSize
						) {
							errorMessage = wc_mnm_params.i18n_min_max_qty_error;
							errorMessage = errorMessage
								.replace( '%max', maxContainerSize )
								.replace( '%min', minContainerSize )
								.replace( '%v', qtyMessage );
							messages.errors.push( errorMessage );
						}
						break;

					// Validate that a container has minimum number of items.
					case minContainerSize >= 0:
						validMessage =
							typeof wc_mnm_params[
								'i18n_' +
									validationContext +
									'_valid_min_message'
							] !== 'undefined'
								? wc_mnm_params[
										'i18n_' +
											validationContext +
											'_valid_min_message'
								  ]
								: wc_mnm_params.i18n_valid_min_message;

						if ( totalQty < minContainerSize ) {
							errorMessage =
								minContainerSize > 1
									? wc_mnm_params.i18n_min_qty_error
									: wc_mnm_params.i18n_min_qty_error_singular;
							errorMessage = errorMessage
								.replace( '%min', minContainerSize )
								.replace( '%v', qtyMessage );
							messages.errors.push( errorMessage );
						}

						break;
				}

				if ( ! messages.errors.length && validMessage !== '' ) {
					validMessage = validMessage
						.replace( '%max', maxContainerSize )
						.replace( '%min', minContainerSize );
					messages.status.push(
						validMessage.replace( '%v', qtyMessage )
					);
				}
			} else {
				messages.errors.push(
					_x(
						'This is not a valid Mix and Match variation and cannot be purchased.',
						'[Frontend]',
						'wc-mnm-variable'
					)
				);
			}

			const validatedState = {
				...state,
				totalQty,
				messages,
				isValid: messages.errors.length === 0,
			};

			const updated = new CustomEvent( 'wc/mnm/container/container-updated', {
				detail: validatedState,
			} );

			// Dispatch an event.
			document.dispatchEvent( updated );
			return validatedState;

		default:
			return state;
	}
};

export default reducer;
