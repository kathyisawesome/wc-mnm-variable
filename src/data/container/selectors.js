export const getSelections = ( state ) => {
	return state.selections;
};

export const getConfiguration = ( state ) => {
	return state.config;
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

export const getContainer = ( state ) => {
	return state.container;
};

export const getChildItems = ( state ) => {
	return state.container &&
		typeof state.container.extensions.mix_and_match !== 'undefined' &&
		typeof state.container.extensions.mix_and_match.child_items !==
			'undefined'
		? state.container.extensions.mix_and_match.child_items
		: [];
};

export const hasChildItems = ( state ) => {
	return getChildItems( state ).length;
};

export const getMinContainerSize = ( state ) => {
	return state.container &&
		typeof state.container.extensions.mix_and_match !== 'undefined' &&
		typeof state.container.extensions.mix_and_match.min_container_size !==
			'undefined'
		? state.container.extensions.mix_and_match.min_container_size
		: 0;
};

export const getMaxContainerSize = ( state ) => {
	return state.container &&
		typeof state.container.extensions.mix_and_match !== 'undefined' &&
		typeof state.container.extensions.mix_and_match.max_container_size !==
			'undefined'
		? state.container.extensions.mix_and_match.max_container_size
		: '';
};

export const isValid = ( state ) => {
	return state.isValid;
};
