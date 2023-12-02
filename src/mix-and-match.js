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
	const [ productId, setProductId ] = useState( 0 );
	const [ variationId, setVariationId ] = useState( 0 );

	// Update the context in the store.
	const { setContext } = useDispatch( CONTAINER_STORE_KEY );

	// Check the product ID and validation context on page load.
	useEffect( () => {

		const productId =  parseInt( 
			target.getAttribute( 'data-product_id' ),
			10
		);

		setProductId( productId );

		const context = target.getAttribute( 'data-validation_context' );
		setContext( context );
	}, [] );

	// Watch for variation changes.
	useMutationObserver(
		target,
		( mutations ) => {
			for ( const mutation of mutations ) {
				if ( mutation.type === 'attributes' ) {
					const newVariationId = parseInt(
						mutation.target.getAttribute( 'data-variation_id' ),
						10
					);
					setVariationId( newVariationId );
				}
			}
		},
		{ attributes: true }
	);

	// Listen for variation ID changes.
	const { product, isLoading } = useSelect(
		( select ) => {
			return {
				product: select( CONTAINER_STORE_KEY ).getProduct( productId, variationId ),
				isLoading: ! select(
					CONTAINER_STORE_KEY
				).hasFinishedResolution( 'getProduct', [ productId, variationId ] ),
			};
		},
		[ variationId ]
	);

	// Quietly return nothing if there's no product ID. Prevents a failed fetch for variable MNM until a variation is selected.
	if ( ! variationId ) {
		return;
	}

	// Loading state.
	if ( isLoading ) {
		return <Loading />;
	}

	// Finally load the app when the product is ready.
	if ( product ) {
		if ( product.id && ! product.is_purchasable ) {
			return <ProductUnavailable />;
		}

		if ( product.id && ! product.is_in_stock ) {
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
