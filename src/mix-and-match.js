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
import ProductUnavailable from '@components/add-to-cart/product-unavailable';
import { CONTAINER_STORE_KEY } from '@data';

const MixAndMatch = ( { target } ) => {

	// Update the context in the store.
	const { setContext, setContainerId } = useDispatch( CONTAINER_STORE_KEY );

	// Check the product ID and validation context on page load.
	useEffect( () => {
		const context = target.getAttribute( 'data-validation_context' );
		setContext( context );
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
	const { container, isLoading , hasValidContainer } = useSelect(
		( select ) => {

			const { getContainerId, getContainerById, hasValidContainer } = select(CONTAINER_STORE_KEY);

			const containerId = getContainerId();

			return {
				container: getContainerById( containerId ),
				isLoading: select(CONTAINER_STORE_KEY).isResolving( 'getContainerById', [ containerId ] ),
				hasValidContainer: hasValidContainer(),
			};
		}
	);

	// Loading state.
	if ( isLoading ) {
		return <Loading />;
	}

	// Finally load the app when the container is ready.
	if ( hasValidContainer ) {

		if ( container.id && ! container.is_purchasable ) {
			return <ProductUnavailable />;
		}

		if ( container.id && ! container.is_in_stock ) {
			return (
				<ProductUnavailable
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
