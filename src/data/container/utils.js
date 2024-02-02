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
			? wc_mnm_params.i18n_qty_message_single
			: wc_mnm_params.i18n_qty_message;
	return message.replace( '%s', qty );
};