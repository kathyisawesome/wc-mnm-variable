/**
 * External dependencies
 */
import { createReduxStore, register } from '@wordpress/data';

/**
 * Internal dependencies
 */
import * as selectors from './selectors';
import * as actions from './actions';
import * as resolvers from './resolvers';
import reducer from './reducer';

import { STORE_KEY as CONTAINER_STORE_KEY } from './constants';

export { CONTAINER_STORE_KEY };

export const store = createReduxStore( CONTAINER_STORE_KEY, {
	reducer,
	selectors,
	resolvers,
	actions,
} );

register( store );
