// Initial State
const DEFAULT_STATE = {
	container: null,
	selections: [],
	config: {},
	totalQty: 0,
	messages: { status: [], errors: [] },
	isValid: false,
	subTotal: 0.0,
	total: 0.0,
	context: 'add-to-cart',
};

export default DEFAULT_STATE;
