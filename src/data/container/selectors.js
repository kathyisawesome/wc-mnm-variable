import { price_format } from "./utils";
/**
 * External dependencies
 */
import { _x } from '@wordpress/i18n';

/**
 * Get the categories for the container
 * 
 * @param {obj} state The current state.
 * @return [array]
 */
export const getCategories = ( state ) => {

	const container = getContainer( state );

	return hasContainer(state) && typeof container.extensions.mix_and_match !== 'undefined' &&
	typeof container.extensions.mix_and_match.child_categories !== 'undefined'
		? container.extensions.mix_and_match.child_categories
		: [];
};

/**
 * Retrieves container configuration from state.
 *
 * @param {obj} state The current state.
 * @return {obj} The object of selected item ids => quantity pairs.
 */
export const getConfiguration = ( state ) => {
	return state.config;
};

/**
 * Get the current container object
 * 
 * @param {obj} state The current state.
 * @return {obj}
 */
export const getContainer = ( state ) => {
	return state.containers.hasOwnProperty(state.containerId)
    ? state.containers[state.containerId]
    : {};
};

/**
 * Get a container object by ID
 * 
 * @param {obj} state The current state.
 * @param int The container ID
 * @return {obj}
 */
export const getContainerById = (state, id) => {
	return state.containers[id];
};

/**
 * Get a current container's ID
 * 
 * @param {obj} state The current state.
 * @return int
 */
export const getContainerId = ( state ) => {
	return state.containerId;
};

/**
 * Format current config status
 * 
 * @param {obj} state The current state.
 * @return string
 */
export const getFormattedStatus = ( state ) => {

	let maxContainerSize = getMaxContainerSize( state ) || _x(
		'∞',
		'[Frontend]',
		'wc-mnm-variable'
	);

	let formattedTotal = 1 === maxContainerSize ? WC_MNM_ADD_TO_CART_VARIATION_PARAMS.i18n_quantity_format_counter_single : WC_MNM_ADD_TO_CART_VARIATION_PARAMS.i18n_quantity_format_counter;
		
	formattedTotal = formattedTotal.replace( '%max', maxContainerSize ).replace( '%s', getTotalQty( state ) );

	return WC_MNM_ADD_TO_CART_VARIATION_PARAMS.i18n_status_format.replace( '%v', price_format( getSubTotal( state ) ) ).replace( '%s', formattedTotal );

}

/**
 * Retrieves container error messages.
 *
 * @param {obj} state The current state.
 * @return [string] Array of messages.
 */
export const getErrorMessages = ( state ) => {
	return state.messages.errors;
};


/**
 * Get the container's child items
 * 
 * @param {obj} state The current state.
 * @return []{obj} An array of child item objects from the REST response.
 */
export const getChildItems = ( state ) => {
	const container = getContainer( state );

	return hasContainer(state) &&
		typeof container.extensions.mix_and_match !== 'undefined' &&
		typeof container.extensions.mix_and_match.child_items !==
			'undefined'
		? container.extensions.mix_and_match.child_items
		: [];
};

/**
 * Max container size
 * 
 * @param {obj} state The current state.
 * @return mixed int|string
 */
export const getMaxContainerSize = ( state ) => {

	const container = getContainer( state );

	return hasContainer(state) &&
		typeof container.extensions.mix_and_match !== 'undefined' &&
		typeof container.extensions.mix_and_match.max_container_size !==
			'undefined'
		? container.extensions.mix_and_match.max_container_size
		: '';
};

/**
 * Retrieves all types of container validation messages.
 *
 * @param {obj} state The current state.
 * @param string The type of message to return if you only want some. 'errors'|'status'
 * @return {obj} The object of selected item ids => quantity pairs.
 */
export const getMessages = ( state, type ) => {
	if ( type === 'errors' ) {
		return state.messages.errors;
	} else if ( type === 'status' ) {
		return state.messages.status;
	}
	return state.messages; // Return all messages.
};

/**
 * Min container size.
 * 
 * @param {obj} state The current state.
 * @return mixed int|string
 */
export const getMinContainerSize = ( state ) => {

	const container = getContainer( state );

	return hasContainer(state) &&
		typeof container.extensions.mix_and_match !== 'undefined' &&
		typeof container.extensions.mix_and_match.min_container_size !==
			'undefined'
		? container.extensions.mix_and_match.min_container_size
		: 0;
};

/**
 * Retrieves quantity of specific child.
 *
 * @param {obj} state The current state.
 * @param int The child ID
 * @return int the quantity
 */
export const getQty = ( state, childId ) => {
	const { config } = state;
	return config.hasOwnProperty( childId ) ? config[ childId ] : '';
};

/**
 * Get the current Selections - an array of all selected child items
 * 
 * @param {obj} state The current state.
 * @return [array] Array of select item objects.
 */
export const getSelections = ( state ) => {
	return state.selections;
};

/**
 * Get a current subtotal
 * 
 * @param {obj} state The current state.
 * @return int
 */
export const getSubTotal = ( state ) => {
	const container = getContainer( state );
	return hasContainer(state) ? container.prices.price / 100 : 0;
};

/**
 * Retrieves container status messages.
 *
 * @param {obj} state The current state.
 * @return [string] Array of messages.
 */
export const getStatusMessages = ( state ) => {
	return state.messages.status;
};

/**
 * Retrieves quantity of total container's configuration.
 *
 * @param {obj} state The current state.
 * @return int the total quantity
 */
export const getTotalQty = ( state ) => {
	return state.totalQty;
};

/**
 * Does the container have child items?
 * 
 * @param {obj} state The current state.
 * @return bool
 */
export const hasChildItems = ( state ) => {
	return getChildItems( state ).length > 0;
};

/**
 * Does the state have any configuration set.
 *
 * @param {obj} state The current state.
 * @return bool
 */
export const hasConfiguration = ( state ) => {
	return Object.entries(state.config).length !== 0;
};

/**
 * Is a container resolved yet?
 * 
 * @param {obj} state The current state.
 * @return bool
 */
export const hasContainer = ( state ) => {
	const container = getContainer( state );
	return container.hasOwnProperty('id');
};

/**
 * Is the container in stock
 * 
 * @param {obj} state The current state.
 * @return bool
 */
export const isInStock = ( state ) => {
	const container = getContainer( state );
	return hasContainer(state) && container.is_in_stock
};

/**
 * Is the app resolving a container?
 * 
 * @param {obj} state The current state.
 * @return int
 */
export const isLoading = ( state ) => {
	return state.loading;
};

/**
 * Is the container purchasable
 * 
 * @param {obj} state The current state.
 * @return bool
 */
export const isPurchasable = ( state ) => {
	const container = getContainer( state );
	return hasContainer(state) && container.is_purchasable;
};

/**
 * Does the container have a valid config?
 * 
 * @param {obj} state The current state.
 * @return bool
 */
export const passesValidation = ( state ) => {
	return true === state.passesValidation;
};