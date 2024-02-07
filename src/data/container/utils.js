/**
 * Calculate the total quantity given any config of ID=>quantity pairs.
 *
 * @param obj    config {
 *               98 => 1,
 *               99 => 2,
 *               }
 * @param config
 */
export const calcTotalQty = ( config ) => {
	return Object.values( config ).reduce(
		( total, qty ) => total + Number( qty ),
		0
	);
};

/**
 * Quantity total message builder.
 *
 * @param int qty
 * @param qty
 */
export const selectedQtyMessage = function ( qty ) {
	const message =
		qty === 1
			? WC_MNM_ADD_TO_CART_VARIATION_PARAMS.i18n_qty_message_single
			: WC_MNM_ADD_TO_CART_VARIATION_PARAMS.i18n_qty_message;
	return message.replace( '%s', qty );
};

/**
 * Converts numbers to formatted price strings. Respects WC price format settings.
 *
 * @param float price The value to format
 * @param object args {
 * 			decimal_sep:       string
 *			currency_position: string
 *			currency_symbol:   string
 *			trim_zeros:        bool,
 *			num_decimals:      int,
 *			html:              bool,
 * }
 */
 export const price_format = function (price, args) {
	const default_args = {
		decimal_sep: WC_MNM_ADD_TO_CART_VARIATION_PARAMS.currency_format_decimal_sep,
		currency_position: WC_MNM_ADD_TO_CART_VARIATION_PARAMS.currency_position,
		currency_symbol: WC_MNM_ADD_TO_CART_VARIATION_PARAMS.currency_symbol,
		trim_zeros: WC_MNM_ADD_TO_CART_VARIATION_PARAMS.currency_format_trim_zeros,
		num_decimals: WC_MNM_ADD_TO_CART_VARIATION_PARAMS.currency_format_num_decimals,
		html: true
	};

	if ('object' !== typeof (args)) {
		// Backcompatibility for boolean args (plain == true meant no HTML).
		args = true === args ? { html : false } : {};
	}

	args = Object.assign( default_args, args );

	price = number_format( price, args );

	let formatted_price  = price;
	const formatted_symbol = args.html ? '<span class="woocommerce-Price-currencySymbol">' + args.currency_symbol + '</span>' : args.currency_symbol;

	switch ( args.currency_position ) {
		case 'left':
			formatted_price = formatted_symbol + formatted_price;
			break;
		case 'right':
			formatted_price = formatted_price + formatted_symbol;
			break;
		case 'left_space':
			formatted_price = formatted_symbol + ' ' + formatted_price;
			break;
		case 'right_space':
			formatted_price = formatted_price + ' ' + formatted_symbol;
			break;
	}

	formatted_price = args.html ? '<span class="woocommerce-Price-amount amount">' + formatted_price + '</span>' : formatted_price;

	return formatted_price;

}

/**
 * Formats price values according to WC settings.
 *
 * @param float number The value to format
 * @param object args {
 * 			decimal_sep      : string
 *			currency_position: string
 *          trim_zeros       : bool,
 *			num_decimals     : int
 * }
 */
export const number_format = function (number, args) {

	const default_args = {
		decimal_sep  : WC_MNM_ADD_TO_CART_VARIATION_PARAMS.currency_format_decimal_sep,
		thousands_sep: WC_MNM_ADD_TO_CART_VARIATION_PARAMS.currency_format_thousand_sep,
		num_decimals : WC_MNM_ADD_TO_CART_VARIATION_PARAMS.currency_format_num_decimals,
		trim_zeros   : WC_MNM_ADD_TO_CART_VARIATION_PARAMS.currency_format_trim_zeros
	};

	args = Object.assign( default_args, args );

	let n = number;
	let c = isNaN( args.num_decimals = Math.abs( args.num_decimals ) ) ? 2 : args.num_decimals;
	let d = args.decimal_sep === undefined ? ',' : args.decimal_sep;
	let t = args.thousands_sep === undefined ? '.' : args.thousands_sep;
	let s = n < 0 ? '-' : '';
	let i = parseInt( n = Math.abs( +n || 0 ).toFixed( c ), 10 ) + '';
	let j = i.length > 3 ? j % 3 : 0;

	let formatted_number = s + (j ? i.substring( 0, j ) + t : '') + i.substring( j ).replace( /(\d{3})(?=\d)/g, '$1' + t ) + (c ? d + Math.abs( n - i ).toFixed( c ).slice( 2 ) : '');

	if ( args.trim_zeros ) {
		const regex        = new RegExp( '\\' + args.decimal_sep + '0+$', 'i' );
		formatted_number = formatted_number.replace( regex, '' );
	}

	return formatted_number;
}
