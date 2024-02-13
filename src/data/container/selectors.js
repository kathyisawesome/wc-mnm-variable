import { price_format } from "./utils";

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
 * Retrieves container configuration from state.
 *
 * @param {obj} state The current state.
 * @return {obj} The object of selected item ids => quantity pairs.
 */
export const getConfiguration = ( state ) => {
	return state.config;
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

export const getMessages = ( state, type ) => {
	if ( type === 'errors' ) {
		return state.messages.errors;
	} else if ( 'status' ) {
		return state.messages.status;
	}
	return state.messages; // Return all messages.
};

export const getErrorMessages = ( state ) => {
	return state.messages.errors;
};

export const getStatusMessages = ( state ) => {
	return state.messages.status;
};

export const getQty = ( state, childId ) => {
	const { config } = state;
	return config.hasOwnProperty( childId ) ? config[ childId ] : '';
};

export const getTotalQty = ( state ) => {
	return state.totalQty;
};

export const getSubTotal = ( state ) => {
	const container = getContainer( state );
	return hasContainer(state) ? container.prices.price / 100 : 0;
};

export const isLoading = ( state ) => {
	return state.loading;
};

export const getContainerId = ( state ) => {
	return state.containerId;
};

export const getContainerById = (state, id) => {
	return state.containers[id];
};

export const getContainer = ( state ) => {
	return state.containers.hasOwnProperty(state.containerId)
    ? state.containers[state.containerId]
    : {};
};

export const getChildItems = ( state ) => {
	const container = getContainer( state );

	return hasContainer(state) &&
		typeof container.extensions.mix_and_match !== 'undefined' &&
		typeof container.extensions.mix_and_match.child_items !==
			'undefined'
		? container.extensions.mix_and_match.child_items
		: [];
};

export const hasContainer = ( state ) => {
	const container = getContainer( state );
	return container.hasOwnProperty('id');
};


export const hasChildItems = ( state ) => {
	return getChildItems( state ).length;
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
 * Does the container have a valid config?
 * 
 * @param {obj} state The current state.
 * @return bool
 */
export const passesValidation = ( state ) => {
	return true === state.passesValidation;
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
 * Is the container in stock
 * 
 * @param {obj} state The current state.
 * @return bool
 */
export const isInStock = ( state ) => {
	const container = getContainer( state );
	return hasContainer(state) && container.is_in_stock
};