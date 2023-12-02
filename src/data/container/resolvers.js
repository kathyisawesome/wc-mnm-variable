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
export function getProduct( productId, variationId ) {
	return async ( { dispatch } ) => {
		try {

			// Only attempt to resolve if there's a product ID here.
			if ( productId && variationId ) {

				const preloadedVariableData = getSetting(
					'wcMNMVariableSettings',
					[]
				);

				if ( preloadedVariableData.hasOwnProperty( productId ) ) {

					let product = preloadedVariableData[productId].find(
						( obj ) => obj.id === variationId
					);
	
					if ( typeof product === 'undefined' ) {
						product = await apiFetch( {
							path: `/wc/store/v1/products/${ variationId }`,
						} );
					}

					dispatch.hydrateProduct( product );

				}
				
			}
		} catch ( error ) {
			// @todo: Handle an error here eventually.
			console.error( error );
		}
	};
}
