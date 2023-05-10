<?php
/**
 * WooCommerce REST API
 *
 * Adds Mix and Match Variation Product data to the WooCommerce REST API.
 *
 * @package  WooCommerce Variable Mix and Match/REST API
 * @since    1.0.0
 * @version  1.0.0
 */

// Exit if accessed directly.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * WC_MNM_Variable_REST_API Class.
 *
 * Adds WooCommerce Mix and Match variation data to WC REST API.
 */
class WC_MNM_Variable_REST_API {

	/**
	 * Setup API class.
	 */
	public static function init() {

		// Register WP REST API custom variation fields.
		add_filter( 'woocommerce_rest_product_variation_schema', array( 'WC_Mix_and_Match_REST_API', 'filter_product_schema' ) );
		add_filter( 'woocommerce_rest_prepare_product_variation_object', array( 'WC_Mix_and_Match_REST_API', 'prepare_product_response' ), 10, 3 );

		// Preload REST Responses.
		add_action( 'woocommerce_variable-mix-and-match_add_to_cart', [ __CLASS__, 'preload_response' ] );

	}

	/**
	 * Setup API class.
	 *
	 * @return object
	 */
	public static function preload_response() {
	
		global $product;
		
		$rest_route = '/wc/v3/products/' . $product->get_id() . '/variations';
		
		Automattic\WooCommerce\Blocks\Package::container()->get( Automattic\WooCommerce\Blocks\Assets\AssetDataRegistry::class )->hydrate_api_request( $rest_route );
		
		$rest_preload_api_requests = rest_preload_api_request( [], $rest_route );
	
		// Currently this will only support 1 vmnm product per page.
		Automattic\WooCommerce\Blocks\Package::container()->get( Automattic\WooCommerce\Blocks\Assets\AssetDataRegistry::class )->add( 'wcMNMVariableSettings', $rest_preload_api_requests[$rest_route]['body'] ?? [] );
	}

}
WC_MNM_Variable_REST_API::init();
