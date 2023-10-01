/**
 * External dependencies
 */
import apiFetch from '@wordpress/api-fetch';
import { getSetting } from '@woocommerce/settings';

/**
 * Fetch a product object from the Store API.
 *
 * @param {number} productId Id of the product to retrieve.
 */
export function getProduct( productId ) {
	return async ( { dispatch } ) => {
		try {
			// Only attempt to resolve if there's a product ID here.
			if ( productId ) {

				const preloadedVariableData = getSetting(
					'wcMNMVariableSettings',
					[]
				);

				let product = preloadedVariableData.find(
					( obj ) => obj.id === productId
				);

				if ( typeof product === 'undefined' ) {
					product = await apiFetch( {
						path: `/wc/store/v1/products/${ productId }`,
					} );
				}

				dispatch.hydrateProduct( product );
			}
		} catch ( error ) {
			// @todo: Handle an error here eventually.
			console.error( error );
		}
	};
}
