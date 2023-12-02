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
	const { items, container } = useSelect( ( select ) => {
		return {
			items: select( CONTAINER_STORE_KEY ).getChildItems(),
			container: select( CONTAINER_STORE_KEY ).getContainer(),
		};
	} );
	
	const [ containerKey, setContainerKey ] = useState( '' );

	const Categories =
		typeof container.extensions.mix_and_match !== 'undefined' &&
		typeof container.extensions.mix_and_match.child_categories !== 'undefined'
			? container.extensions.mix_and_match.child_categories
			: [];

	/**
	 * Check the update cart parameters exists or not.
	 */
	useEffect( () => {
		const params = new URLSearchParams( window.location.search );
		if ( params.get( 'update-container' ) ) {
			setContainerKey( params.get( 'update-container' ) );
		}
	}, [] );

	return (
		<>
			<ChildItems childItems={ items } childCategories={ Categories } />
			{containerKey ? <input type="hidden" name="update-container" value={containerKey} /> : ''}
			<Reset />
			<StatusUI />
		</>
	);
};

export default AddToCart;
