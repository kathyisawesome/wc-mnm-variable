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

	// Update the context in the store.
	const { setContext } = useDispatch( CONTAINER_STORE_KEY );

	// Check the validation context on page load.
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
					const newProductId = parseInt(
						mutation.target.getAttribute( 'data-product_id' ),
						10
					);
					setProductId( newProductId );
				}
			}
		},
		{ attributes: true }
	);

	// Listen for product ID changes.
	const { product, isLoading } = useSelect(
		( select ) => {
			return {
				product: select( CONTAINER_STORE_KEY ).getProduct( productId ),
				isLoading: ! select(
					CONTAINER_STORE_KEY
				).hasFinishedResolution( 'getProduct', [ productId ] ),
			};
		},
		[ productId ]
	);

	// Quietly return nothing if there's no product ID. Prevents a failed fetch for variable MNM until a variation is selected.
	if ( ! productId ) {
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
						'woo-gutenberg-products-block'
					) }
				/>
			);
		}

		return <AddToCart />;
	}
};
export default MixAndMatch;