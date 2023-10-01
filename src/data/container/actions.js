/**
 * External dependencies
 */
import { useDispatch } from '@wordpress/data';

/**
 * Internal dependencies
 */
import TYPES from './action-types';
const { HYDRATE_PRODUCT, RESET_CONFIG, SET_CONTEXT, UPDATE_CONFIG, UPDATE_QTY, VALIDATE } =
	TYPES;

import { CONTAINER_STORE_KEY } from '@data';

// Set the product.
export const hydrateProduct =
	( product ) =>
	( { select, dispatch } ) => {
		dispatch( { type: HYDRATE_PRODUCT, payload: { product } } );
		dispatch( { type: VALIDATE } );
	};

// Clear the config.
export const resetConfig =
	() =>
	( { select, dispatch } ) => {
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