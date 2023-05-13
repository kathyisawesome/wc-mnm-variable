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
				'description' => __( 'Cart item key of mix and match product that contains this item.', 'wc-mnm-variable' ),
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
			$item_data['child_items']         = self::prepare_child_items_response( $product );
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
				'description' => __( 'Has product-specific layouts that override global setting. Applicable only for Mix and Match type products.', 'wc-mnm-variable' ),
				'type'        => 'boolean',
				'context'     => array( 'view' ),
				'readonly'    => true,
			),
			'layout'              => array(
				'description' => __( 'Single-product details page layout. Applicable only for Mix and Match type products.', 'wc-mnm-variable' ),
				'type'        => 'string',
				'enum'        => array_keys( WC_Product_Mix_and_Match::get_layout_options() ),
				'context'     => array( 'view' ),
				'readonly'    => true,
			),
			'form_location' => array(
				'description' => __( 'Single-product details page add to cart form location. Applicable only for Mix and Match type products.', 'wc-mnm-variable' ),
				'type'        => 'string',
				'enum'        => array_keys( WC_Product_Mix_and_Match::get_add_to_cart_form_location_options() ),
				'context'     => array( 'view' ),
				'readonly'    => true,
			),
			'content_source' => array(
				'description' => __( 'Source of child products. Applicable only for Mix and Match type products.', 'wc-mnm-variable' ),
				'type'        => 'string',
				'enum'        => array( 'products', 'categories' ),
				'context'     => array( 'view' ),
				'readonly'    => true,
			),
			'child_category_ids' => array(
				'description' => __( 'List of child categories allowed in this product.', 'wc-mnm-variable' ),
				'type'        => 'array',
				'context'     => array( 'view' ),
				'readonly'    => true,
			),
			'child_items'     => array(
				'description' => __( 'List of child items contained in this product.', 'wc-mnm-variable' ),
				'type'        => 'array',
				'context'     => array( 'view' ),
				'readonly'    => true,
				'items'       => array(
					'type'       => 'object',
					'properties' => array(
						'availability' => array(
							'description' => __( 'Child item product availability.', 'wc-mnm-variable' ),
							'type'        => 'object',
							'properties' => array(
								'availability' => array(
									'description' => __( 'Child product available text', 'wc-mnm-variable' ),
									'type'        => 'string',
									'context'     => array( 'view' ),
									'readonly'    => true,
								),
								'class'            => array(
									'description' => __( 'Child item product available html class.', 'wc-mnm-variable' ),
									'type'        => 'string',
									'context'     => array( 'view' ),
									'readonly'    => true,
								),
							),
							'context'     => array( 'view' ),
							'readonly'    => true,
						),
						'catalog_visibility'            => array(
							'description' => __( 'Child item product cataglog visibility.', 'wc-mnm-variable' ),
							'type'        => 'string',
							'context'     => array( 'view' ),
							'readonly'    => true,
						),
						'child_id'            => array(
							'description' => __( 'Child product|variation ID.', 'wc-mnm-variable' ),
							'type'        => 'integer',
							'context'     => array( 'view' ),
							'readonly'    => true,
						),
						'child_item_id'            => array(
							'description' => __( 'Child item ID.', 'wc-mnm-variable' ),
							'type'        => 'integer',
							'context'     => array( 'view' ),
							'readonly'    => true,
						),
						'max_qty' => array(
							'description' => __( 'Child item maximum quantity.', 'wc-mnm-variable' ),
							'type'        => 'integer',
							'context'     => array( 'view' ),
							'readonly'    => true,
						),
						'min_qty'   => array(
							'description' => __( 'Child item minimum quantity.', 'wc-mnm-variable' ),
							'type'        => 'integer',
							'context'     => array( 'view' ),
							'readonly'    => true,
						),
						'step_qty' => array(
							'description' => __( 'Child item step quantity.', 'wc-mnm-variable' ),
							'type'        => 'integer',
							'context'     => array( 'view' ),
							'readonly'    => true,
						),
						'price_html'            => array(
							'description' => __( 'Child item product price html text.', 'wc-mnm-variable' ),
							'type'        => 'string',
							'context'     => array( 'view' ),
							'readonly'    => true,
						),
						'product_id'   => array(
							'description' => __( 'Child product ID.', 'wc-mnm-variable' ),
							'type'        => 'integer',
							'context'     => array( 'view' ),
							'readonly'    => true,
						),
						'images'            => array(
							'description' => __( 'Child item product images.', 'wc-mnm-variable' ),
							'type'        => 'array',
							'context'     => array( 'view' ),
							'readonly'    => true,
							'items'       => array(
								'type'       => 'object',
								'properties'  => array(
									'alt'            => array(
										'description' => __( 'Image attachment alt text.', 'wc-mnm-variable' ),
										'type'        => 'string',
										'context'     => array( 'view' ),
										'readonly'    => true,
									),
									'id'            => array(
										'description' => __( 'Image attachment ID.', 'wc-mnm-variable' ),
										'type'        => 'integer',
										'context'     => array( 'view' ),
										'readonly'    => true,
									),
									'name'            => array(
										'description' => __( 'Image attachment name.', 'wc-mnm-variable' ),
										'type'        => 'string',
										'context'     => array( 'view' ),
										'readonly'    => true,
									),
									'src'            => array(
										'description' => __( 'Image attachment src.', 'wc-mnm-variable' ),
										'type'        => 'string',
										'context'     => array( 'view' ),
										'readonly'    => true,
									),
								)
							)
						),
						'in_stock' => array(
							'description' => __( 'Child item product is in stock.', 'wc-mnm-variable' ),
							'type'        => 'boolean',
							'context'     => array( 'view' ),
							'readonly'    => true,
						),
						'name'            => array(
							'description' => __( 'Child item product title', 'wc-mnm-variable' ),
							'type'        => 'string',
							'context'     => array( 'view' ),
							'readonly'    => true,
						),
						'permalink'            => array(
							'description' => __( 'Child item product permalink.', 'wc-mnm-variable' ),
							'type'        => 'string',
							'context'     => array( 'view' ),
							'readonly'    => true,
						),
						'purchasable' => array(
							'description' => __( 'Child item product purchasble status.', 'wc-mnm-variable' ),
							'type'        => 'boolean',
							'context'     => array( 'view' ),
							'readonly'    => true,
						),
						'qty' => array(
							'description' => __( 'Child item quantity.', 'wc-mnm-variable' ),
							'type'        => 'integer',
							'context'     => array( 'view' ),
							'readonly'    => true,
						),
						'short_description'            => array(
							'description' => __( 'Child item product short description.', 'wc-mnm-variable' ),
							'type'        => 'string',
							'context'     => array( 'view' ),
							'readonly'    => true,
						),
						'variation_id' => array(
							'description' => __( 'Child variation ID.', 'wc-mnm-variable' ),
							'type'        => 'integer',
							'context'     => array( 'view' ),
							'readonly'    => true,
						),
					)
				)
			),
			'min_container_size'   => array(
				'description' => __( 'Minimum container size.', 'wc-mnm-variable' ),
				'type'        => 'integer',
				'context'     => array( 'view' ),
				'readonly'    => true,
			),
			'max_container_size'   => array(
				'description' => __( 'Maximum container quantity.', 'wc-mnm-variable' ),
				'type'        => 'mixed',
				'oneOf'       => array(
					'type' => 'integer',
					'type' => null,
				),
				'context'     => array( 'view' ),
				'readonly'    => true,
			),
			'discount' => array(
				'description' => __( 'Indicates the percentage discount to apply to each child product when per-product pricing is enabled.', 'wc-mnm-variable' ),
				'type'        => 'string',
				'context'     => array( 'view' ),
				'readonly'    => true,
			),
			'priced_per_product' => array(
				'description' => __( 'Indicates whether the container price is calculated from the price of the selected child products.', 'wc-mnm-variable' ),
				'type'        => 'boolean',
				'context'     => array( 'view' ),
				'readonly'    => true,
			),
			'packing_mode' => array(
				'description' => __( 'Indicates how the child products are packed/shipped.', 'wc-mnm-variable' ),
				'type'        => 'boolean',
				'enum'        => array( 'virtual', 'together', 'separate', 'separate_plus' ),
				'context'     => array( 'view' ),
				'readonly'    => true,
			),
			'shipped_per_product' => array(
				'description' => __( 'Deprecated: Indicates whether the child products are shipped individually.', 'wc-mnm-variable' ),
				'type'        => 'boolean',
				'context'     => array( 'view' ),
				'readonly'    => true,
			),
			'weight_cumulative' => array(
				'description' => __( 'Shipping weight calculation mode.', 'wc-mnm-variable' ),
				'type'        => 'boolean',
				'context'     => array( 'view' ),
				'readonly'    => true,
			),
		);
	}

	/**
	 * Convert child items into a REST readable array.
	 * 
	 * This is a dupe of the MNM function for now since that is private and we can't call it here.
	 *
	 * @param WC_Product     $product  Product object.
	 * @return array
	 */
	private static function prepare_child_items_response( $product ) {
		$child_items = $product->get_child_items();
		$response_items = array();
		foreach( $child_items as $child_item ) {

			/**
			 * Individual child item Store API response.
			 *
			 * @param array $response
			 * @param  obj WC_MNM_Child_Item $child_item of child item
			 * @param  obj WC_Product_Mix_and_Match $product
			 */	
			$response_items[] = apply_filters( 'wc_mnm_child_item_store_api_response', array(
				'child_item_id'      => $child_item->get_id(),
				'child_id'           => $child_item->get_variation_id() ? $child_item->get_variation_id() : $child_item->get_product_id(),
				'product_id'         => $child_item->get_product_id(),
				'variation_id'       => $child_item->get_variation_id(),
				'min_qty'            => $child_item->get_quantity( 'min' ),
				'max_qty'            => $child_item->get_quantity( 'max' ),
				'step_qty'           => $child_item->get_quantity( 'step' ),
				'qty'                => $child_item->get_quantity(),
				'availability'       => $child_item->get_product()->get_availability(),
				'purchasable'        => $child_item->get_product()->is_purchasable(),
				'in_stock'           => $child_item->get_product()->is_in_stock(),
				'price_html'         => $child_item->get_product()->get_price_html(),
				'catalog_visibility' => $child_item->get_product()->get_catalog_visibility(),
				'images'             => self::get_images( $child_item, $product ),
				'name'               => $child_item->get_product()->get_name(),
				'permalink'          => $child_item->get_product()->get_permalink(),
				'short_description'  => $child_item->get_product()->get_short_description(),	
			), $child_item, $product );
		}

		return $response_items;
	}


	

	/**
	 * Get the images for a child item's product.
	 *
	 * @param WC_MNM_Child_Item.
	 *
	 * @return array
	 */
	private static function get_images( $child_item, $container_product ) {

		$product = $child_item->get_product();

		/**
		 * Child item thumbnail size.
		 *
		 * @since 2.0.0
		 *
		 * @param string $size
		 * @param  obj WC_MNM_Child_Item $child_item of child item
		 * @param  obj WC_Product_Mix_and_Match $product
		 */
		$image_size    = apply_filters( 'wc_mnm_child_item_thumbnail_size', 'woocommerce_thumbnail', $child_item, $container_product );

		$images         = array();
		$attachment_ids = array();

		// Add featured image.
		if ( $product->get_image_id() ) {
			$attachment_ids[] = $product->get_image_id();
		}

		// Build image data.
		foreach ( $attachment_ids as $position => $attachment_id ) {
			$attachment_post = get_post( $attachment_id );
			if ( is_null( $attachment_post ) ) {
				continue;
			}

			$attachment = wp_get_attachment_image_src( $attachment_id, $image_size );
			if ( ! is_array( $attachment ) ) {
				continue;
			}

			$images[] = array(
				'id'                => (int) $attachment_id,
				'src'               => current( $attachment ),
				'name'              => get_the_title( $attachment_id ),
				'alt'               => get_post_meta( $attachment_id, '_wp_attachment_image_alt', true ),
			);
		}

		// Set a placeholder image if the product has no images set.
		if ( empty( $images ) ) {
			$images[] = array(
				'id'                => 0,
				'src'               => wc_placeholder_img_src(),
				'name'              => __( 'Placeholder', 'wc-mnm-variable' ),
				'alt'               => __( 'Placeholder', 'wc-mnm-variable' ),
			);
		}

		return $images;
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
