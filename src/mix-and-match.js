/**
 * External dependencies
 */
import { useMutationObserver } from '@react-hooks-library/core';
import { useEffect, useState } from '@wordpress/element';
import { useDispatch, useSelect } from '@wordpress/data';
import { _x } from '@wordpress/i18n';

/**
 * Internal dependencies
 */
import AddToCart from '@components/add-to-cart';
import Loading from '@components/add-to-cart/loading';
import Unavailable from '@components/add-to-cart/unavailable';
import { CONTAINER_STORE_KEY } from '@data';

const MixAndMatch = ( { target } ) => {

	const { setContext, setContainerId, setConfig } = useDispatch( CONTAINER_STORE_KEY );

	// Update some store data on page load.
	useEffect( () => {
		
		const context = target.getAttribute( 'data-validation_context' );
		if ( context ) {
			setContext( context );
		}

		// Read the config from either the URL or the data-attributes.
		let initConfig = target.getAttribute( 'data-container_config' );

		// If nothing in the data-attributes, check the URL params.
		if ( ! initConfig ) {

			// Create a URLSearchParams object from the query string
			const params = new URLSearchParams(window.location.search);

			// Initialize an object to store parsed values
			initConfig = {};

			// Iterate over the parameters
			params.forEach((value, key) => {

				if (key.startsWith('mnm_quantity')) { // Currently we only support `mnm_quantity` input names.

					// Using regular expression to extract the number
					const match = key.match(/\[(\d+)\]/);

					// Check if there is a match and extract the number
					const productId = match ? parseFloat(match[1], 10) : null;

					// Store the value in the parsed object
					initConfig[productId] = value;

				}

			});

		}

		if ( initConfig ) {
			setConfig( initConfig );
		}

	}, [] );

	// Watch for variation changes.
	useMutationObserver(
		target,
		( mutations ) => {
			for ( const mutation of mutations ) {
				if ( mutation.type === 'attributes' ) {
					const variationId = parseInt(
						mutation.target.getAttribute( 'data-variation_id' ),
						10
					);

					setContainerId(variationId);

				}
			}
		},
		{ attributes: true }
	);

	// Get container from the store.
	const { container, isLoading , hasContainer } = useSelect(
		( select ) => {

			const { getContainerId, getContainerById, hasContainer } = select(CONTAINER_STORE_KEY);

			const containerId = getContainerId();

			return {
				container: getContainerById( containerId ),
				isLoading: select(CONTAINER_STORE_KEY).isResolving( 'getContainerById', [ containerId ] ),
				hasContainer: hasContainer(),
			};
		}
	);

	// Loading state.
	if ( isLoading ) {
		return <Loading />;
	}

	// Finally load the app when the container is ready.
	if ( hasContainer ) {

		if ( container.id && ! container.is_purchasable ) {
			return <Unavailable />;
		}

		if ( container.id && ! container.is_in_stock ) {
			return (
				<Unavailable
					reason={ _x(
						'This product is currently out of stock and cannot be purchased.',
						'[Frontend]',
						'wc-mnm-variable'
					) }
				/>
			);
		}

		return <AddToCart />;
	}
};
export default MixAndMatch;
