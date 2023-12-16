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
export function getContainer( productId, variationId ) {
	return async ( { dispatch } ) => {
		try {

			// Only attempt to resolve if there's a product ID here.
			if ( productId && variationId ) {

				const preloadedVariableData = getSetting(
					'wcMNMVariableSettings',
					[]
				);

				let container = false;

				if ( preloadedVariableData.hasOwnProperty( productId ) ) {

					container = preloadedVariableData[productId].find(
						( obj ) => obj.id === variationId
					);

				}

				if ( typeof container !== 'object' ) {
					container = await apiFetch( {
						path: `/wc/store/v1/products/${ variationId }`,
					} );
				}

				dispatch.hydrateContainer( container );
				
			}
		} catch ( error ) {
			// @todo: Handle an error here eventually.
			console.error( error );
		}
	};
}
