import { useEffect, useState } from '@wordpress/element';
import { useSelect } from '@wordpress/data';

/**
 * Internal dependencies
 */
import './style.scss';

import { CONTAINER_STORE_KEY } from '@data';

import ChildItems from './child-items';
import Reset from './reset';
import StatusUI from '@components/status-ui';

const AddToCart = () => {
	// Get the child Items from the data store.
	const { childItems, categories, maxContainerSize } = useSelect( ( select ) => {
		return {
			childItems: select( CONTAINER_STORE_KEY ).getChildItems(),
			categories: select( CONTAINER_STORE_KEY ).getCategories(),
			maxContainerSize: select( CONTAINER_STORE_KEY ).getMaxContainerSize(),
		};
	} );

	const [ prompt, setPrompt ] = useState('');
	const [ containerKey, setContainerKey ] = useState( '' );

	/**
	 * Check the update cart parameters exists or not.
	 */
	useEffect( () => {
		const params = new URLSearchParams( window.location.search );
		if ( params.get( 'update-container' ) ) {
			setContainerKey( params.get( 'update-container' ) );
		}
	}, [] );

	/**
	 * Encourage users with a prompt to fill in their container.
	 */
	useEffect( () => {
		let promptText = maxContainerSize === 1 ? WC_MNM_ADD_TO_CART_VARIATION_PARAMS.i18n_selection_prompt_singular : WC_MNM_ADD_TO_CART_VARIATION_PARAMS.i18n_selection_prompt;
		setPrompt( promptText.replace( '%d', maxContainerSize ) );
	}, [maxContainerSize] );

	return (
		<>
			<h2 className="wc-mnm-variation__select-prompt">{ prompt }</h2>
			<ChildItems childItems={ childItems } childCategories={ categories } />
			{containerKey ? <input type="hidden" name="update-container" value={containerKey} /> : ''}
			<Reset />
			<StatusUI />
		</>
	);
};

export default AddToCart;
