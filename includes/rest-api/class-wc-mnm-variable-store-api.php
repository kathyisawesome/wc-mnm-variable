<?php
/**
 * WooCommerce Store API
 *
 * Adds Mix and Match Variation Product data to the WooCommerce Store API.
 *
 * @package  WooCommerce Variable Mix and Match/Store API
 * @since    1.0.0
 * @version  1.0.0
 */

use Automattic\WooCommerce\StoreApi\Schemas\V1\ProductSchema;
use Automattic\WooCommerce\StoreApi\Utilities\ProductQuery;

// Exit if accessed directly.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * WC_MNM_Variable_Store_API Class.
 *
 * Adds WooCommerce Mix and Match variation data to WC Store API.
 */
class WC_MNM_Variable_Store_API {

	/**
	 * Plugin Identifier, unique to each plugin.
	 *
	 * @var string
	 */
	const IDENTIFIER = 'variable_mix_and_match';

	/**
	 * Setup API class.
	 */
	public static function init() {

		// Add all variations to response.
		woocommerce_store_api_register_endpoint_data(
			array(
				'endpoint'        => ProductSchema::IDENTIFIER,
				'namespace'       => self::IDENTIFIER,
				'data_callback'   => array( __CLASS__, 'extend_product_data' ),
				'schema_callback' => array( __CLASS__, 'extend_product_schema' ),
				'schema_type'     => ARRAY_A,
			)
		);


		// Extend Regular Mix and Match Product Data. (Eventually move this to MNM core)
		woocommerce_store_api_register_endpoint_data(
			array(
				'endpoint'        => ProductSchema::IDENTIFIER,
				'namespace'       => 'mix_and_match',
				'data_callback'   => array( __CLASS__, 'extend_mnm_product_data' ),
				'schema_callback' => array( __CLASS__, 'extend_mnm_product_schema' ),
				'schema_type'     => ARRAY_A,
			)
		);

		// Preload REST Responses.
		add_action( 'woocommerce_variable-mix-and-match_add_to_cart', [ __CLASS__, 'preload_response' ] );

	}


	/**
	 * Registers the actual data into each endpoint.
	 */
	public static function add_variations_endpoint() {


	}

	/**
	 * Register parent/child product data into cart/items endpoint.
	 *
	 * @param WC_Product  $product
	 * @return array $item_data
	 */
	public static function extend_product_data( $product ) {

		$item_data = [ 'variations' => [] ];

		if ( $product->is_type( 'variable-mix-and-match' ) ) {

			$request  = new \WP_REST_Request( 'GET', "/wc/store/v1/products" );

			$request->set_query_params(
				array(
					'type'      => 'variation',
					'per_page'	=> 0,
					'include'	=> $product->get_visible_children(),
					'order'     => 'asc',
					'orderby'	=> 'id',
				)
			);

			$response = rest_do_request( $request );

			// Make an internal request to load complete variation data.
			if ( 200 === $response->get_status() ) {
				error_log('response ' . json_encode( $response->get_data()));
				$item_data['variations'] = (array) $response->get_data();
			}
		
		}

		return $item_data;
	}

	/**
	 * Register variations schema into product endpoint. @todo - what goes here?
	 *
	 * @return array Registered schema.
	 */
	public static function extend_product_schema() {
		return array(
			'variations'           => array(
				'description' => __( 'Cart item key of mix and match product that contains this item.', 'woocommerce-mix-and-match-products' ),
				'type'        => array( 'string', 'null' ),
				'context'     => array( 'view' ),
				'readonly'    => true,
			)
		);
	}
	

	/*-----------------------------------------------------------------------------------*/
	/*  Mix and Match Product Data                                                       */
	/*-----------------------------------------------------------------------------------*/

	/**
	 * Register parent/child product data into cart/items endpoint.
	 *
	 * @param WC_Product  $product
	 * @return array $item_data
	 */
	public static function extend_mnm_product_data( $product ) {

		$item_data = [];

		if ( wc_mnm_is_product_container_type( $product ) ) {
			$item_data['layout_override']     = $product->has_layout_override();
			$item_data['layout']              = $product->get_layout();
			$item_data['form_location']       = $product->get_add_to_cart_form_location();
			$item_data['content_source']      = $product->get_content_source();
			$item_data['child_category_ids']  = $product->get_child_category_ids();
			$item_data['min_container_size']  = $product->get_min_container_size();
			$item_data['max_container_size']  = $product->get_max_container_size();
			$item_data['priced_per_product']  = $product->is_priced_per_product();
			$item_data['packing_mode']        = $product->get_packing_mode();
			$item_data['shipped_per_product'] = ! $product->is_packed_together();
			$item_data['weight_cumulative']   = $product->is_weight_cumulative();
			$item_data['discount']            = $product->get_discount();
			$item_data['child_items']         = WC_Mix_and_Match_REST_API::prepare_child_items_response( $product );
		}

		return $item_data;
	}

	/**
	 * Register variations schema into product endpoint.
	 *
	 * @return array Registered schema.
	 */
	public static function extend_mnm_product_schema() {

		return array(
			'layout_override' => array(
				'description' => __( 'Has product-specific layouts that override global setting. Applicable only for Mix and Match type products.', 'woocommerce-mix-and-match-products' ),
				'type'        => 'boolean',
				'context'     => array( 'view' ),
				'readonly'    => true,
			),
			'layout'              => array(
				'description' => __( 'Single-product details page layout. Applicable only for Mix and Match type products.', 'woocommerce-mix-and-match-products' ),
				'type'        => 'string',
				'enum'        => array_keys( WC_Product_Mix_and_Match::get_layout_options() ),
				'context'     => array( 'view' ),
				'readonly'    => true,
			),
			'form_location' => array(
				'description' => __( 'Single-product details page add to cart form location. Applicable only for Mix and Match type products.', 'woocommerce-mix-and-match-products' ),
				'type'        => 'string',
				'enum'        => array_keys( WC_Product_Mix_and_Match::get_add_to_cart_form_location_options() ),
				'context'     => array( 'view' ),
				'readonly'    => true,
			),
			'content_source' => array(
				'description' => __( 'Source of child products. Applicable only for Mix and Match type products.', 'woocommerce-mix-and-match-products' ),
				'type'        => 'string',
				'enum'        => array( 'products', 'categories' ),
				'context'     => array( 'view' ),
				'readonly'    => true,
			),
			'child_category_ids' => array(
				'description' => __( 'List of child categories allowed in this product.', 'woocommerce-mix-and-match-products' ),
				'type'        => 'array',
				'context'     => array( 'view' ),
				'readonly'    => true,
			),
			'child_items'              => array(
				'description' => __( 'List of child items contained in this product.', 'woocommerce-mix-and-match-products' ),
				'type'        => 'array',
				'context'     => array( 'view' ),
				'readonly'    => true,
				'items'       => array(
					'type'       => 'object',
					'properties' => array(
						'child_id'            => array(
							'description' => __( 'Child product|variation ID. Deprecated 2.0, use child_item_id instead.', 'woocommerce-mix-and-match-products' ),
							'type'        => 'integer',
							'context'     => array( 'view' ),
							'readonly'    => true,
						),
						'child_item_id'            => array(
							'description' => __( 'Child item ID.', 'woocommerce-mix-and-match-products' ),
							'type'        => 'integer',
							'context'     => array( 'view' ),
							'readonly'    => true,
						),
						'product_id'   => array(
							'description' => __( 'Child product ID.', 'woocommerce-mix-and-match-products' ),
							'type'        => 'integer',
							'context'     => array( 'view' ),
							'readonly'    => true,
						),
						'variation_id' => array(
							'description' => __( 'Child variation ID.', 'woocommerce-mix-and-match-products' ),
							'type'        => 'integer',
							'context'     => array( 'view' ),
							'readonly'    => true,
						),
					)
				)
			),
			'min_container_size'   => array(
				'description' => __( 'Minimum container size.', 'woocommerce-mix-and-match-products' ),
				'type'        => 'integer',
				'context'     => array( 'view' ),
				'readonly'    => true,
			),
			'max_container_size'   => array(
				'description' => __( 'Maximum container quantity.', 'woocommerce-mix-and-match-products' ),
				'type'        => 'mixed',
				'oneOf'       => array(
					'type' => 'integer',
					'type' => null,
				),
				'context'     => array( 'view' ),
				'readonly'    => true,
			),
			'discount' => array(
				'description' => __( 'Indicates the percentage discount to apply to each child product when per-product pricing is enabled.', 'woocommerce-mix-and-match-products' ),
				'type'        => 'string',
				'context'     => array( 'view' ),
				'readonly'    => true,
			),
			'priced_per_product' => array(
				'description' => __( 'Indicates whether the container price is calculated from the price of the selected child products.', 'woocommerce-mix-and-match-products' ),
				'type'        => 'boolean',
				'context'     => array( 'view' ),
				'readonly'    => true,
			),
			'packing_mode' => array(
				'description' => __( 'Indicates how the child products are packed/shipped.', 'woocommerce-mix-and-match-products' ),
				'type'        => 'boolean',
				'enum'        => array( 'virtual', 'together', 'separate', 'separate_plus' ),
				'context'     => array( 'view' ),
				'readonly'    => true,
			),
			'shipped_per_product' => array(
				'description' => __( 'Deprecated: Indicates whether the child products are shipped individually.', 'woocommerce-mix-and-match-products' ),
				'type'        => 'boolean',
				'context'     => array( 'view' ),
				'readonly'    => true,
			),
			'weight_cumulative' => array(
				'description' => __( 'Shipping weight calculation mode.', 'woocommerce-mix-and-match-products' ),
				'type'        => 'boolean',
				'context'     => array( 'view' ),
				'readonly'    => true,
			),
		);
	}


	/*-----------------------------------------------------------------------------------*/
	/*  Preloading                                                                       */
	/*-----------------------------------------------------------------------------------*/


	/**
	 * Preload all variations into WC settings.
	 *
	 * @return object
	 */
	public static function preload_response() {
	
		global $product;

		$rest_route = '/wc/store/v1/products/' . $product->get_id() ;
		
		Automattic\WooCommerce\Blocks\Package::container()->get( Automattic\WooCommerce\Blocks\Assets\AssetDataRegistry::class )->hydrate_api_request( $rest_route );
		
		$rest_preload_api_requests = rest_preload_api_request( [], $rest_route );

		$data = $rest_preload_api_requests[$rest_route]['body']['extensions']->variable_mix_and_match['variations'] ?? [];

		// Currently this will only support 1 vmnm product per page.
		Automattic\WooCommerce\Blocks\Package::container()->get( Automattic\WooCommerce\Blocks\Assets\AssetDataRegistry::class )->add( 'wcMNMVariableSettings', $data );
	}

}
WC_MNM_Variable_Store_API::init();
