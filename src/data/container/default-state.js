// Initial State.
const DEFAULT_STATE = {
	basePrice: { price: 0, regular_price: 0 },
	containers: {},
	containerId: null,
	selections: [],
	config: {},
	totalQty: 0,
	messages: { status: [], errors: [] },
	passesValidation: false,
	context: 'add-to-cart',
	subTotal: { price: 0, regular_price: 0 },
	total: { price: 0, regular_price: 0 },
};

export default DEFAULT_STATE;
