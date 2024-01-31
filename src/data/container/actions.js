/**
 * External dependencies
 */
import { useDispatch } from '@wordpress/data';

/**
 * Internal dependencies
 */
import TYPES from './action-types';
const { SET_CONTAINER_ID, HYDRATE_CONTAINER, RESET_CONFIG, SET_CONTEXT, UPDATE_CONFIG, UPDATE_QTY, VALIDATE } =
	TYPES;

// Set the product ID.
export const setContainerId =
	( containerId ) =>
	( { select, dispatch } ) => {
		dispatch( { type: SET_CONTAINER_ID, payload: { containerId } } );

	};

// Set the product.
export const hydrateContainer =
	( container ) =>
	( { dispatch } ) => {
		dispatch( { type: HYDRATE_CONTAINER, payload: { container } } );
		dispatch( { type: VALIDATE } );
	};

// Clear the config.
export const resetConfig =
	() =>
	( { dispatch } ) => {
		dispatch( { type: RESET_CONFIG } );
		dispatch( { type: VALIDATE } );
	};

// Set the validation context.
export const setContext =
	(context) => {
		return {
			type: SET_CONTEXT,
			payload: {
				context,
			},
		};
	};

// Update the entire config at once.
export const updateConfig =
	( config ) =>
	( { select, dispatch } ) => {
		dispatch( { type: UPDATE_CONFIG, payload: { config } } );
		dispatch( { type: VALIDATE } );
	};

// Update the config when a single quantity is changed.
export const updateQty =
	( { item, qty } ) =>
	( { select, dispatch } ) => {
		dispatch( {
			type: UPDATE_QTY,
			payload: {
				item,
				qty,
			},
		} );
		dispatch( { type: VALIDATE } );
	};

// Validate the container after it has been updated.
export const validate = () => {
	return {
		type: VALIDATE,
	};
};
