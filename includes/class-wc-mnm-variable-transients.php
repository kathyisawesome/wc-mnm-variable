<?php
/**
 * Transients - Loading the variation form can be quite slow, use transients as a bandaid until a React re-write.
 *
 * @package  WooCommerce Mix and Match Products/Transients
 * @since    1.0.0
 * @version  1.0.0
 */

// Exit if accessed directly.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * WC_MNM_Variable_Transients Class.
 *
 * Mix and Match order caching helper functions.
 */
class WC_MNM_Variable_Transients {

	public static function init() {
		add_action( 'woocommerce_delete_product_transients', array( __CLASS__, 'delete_transients' ) );

		// Delete any upstream containers.
		add_action( 'woocommerce_update_product', array( __CLASS__, 'delete_container_transients' ) );
		add_action( 'woocommerce_update_product_variation', array( __CLASS__, 'delete_container_transients' ) );

		add_action( 'woocommerce_delete_product', array( __CLASS__, 'delete_container_transients' ) );
		add_action( 'woocommerce_trash_product', array( __CLASS__, 'delete_container_transients' ) );
		add_action( 'woocommerce_delete_product_variation', array( __CLASS__, 'delete_container_transients' ) );
		add_action( 'woocommerce_trash_product_variation', array( __CLASS__, 'delete_container_transients' ) );

	}

	/**
	 * When a product is updated find any containers it is part of and clear those transients.
	 *
	 * @param  int  $post_id
	 */
	public static function delete_container_transients( $post_id ) {

		// Grab a variation's parent ID.
		$parent_id = wp_get_post_parent_id( $post_id );

		// Delete a specific MNM variation's transient.
		self::delete_transients( $post_id, $parent_id );

		// Delete any transients for containers this product is a part of.
		$data_store = WC_Data_Store::load( 'product-mix-and-match' );

		$container_ids = $data_store->query_containers_by_product( $post_id );

		if ( ! empty( $container_ids ) ) {
			foreach( $container_ids as $id ) {
				self::delete_transients( $id );
			}
		}


	}


	/**
	 * Clear ALL form transients.
	 *
	 * @param  string  $key
	 * @param  string  $group_key
	 * @return mixed
	 */
	public static function delete_transients( $product_id, $variation_id = '', $category_ids = array() ) {

		global $wpdb;
		$prefix = 'wc_mnm_variation_add_to_cart_' . $product_id;

		if ( $variation_id ) {
			$prefix .= '_variation:' . $variation_id;
		}
		$transients = $wpdb->get_col( "SELECT `option_name` FROM $wpdb->options WHERE `option_name` LIKE '%{$prefix}%'" );
		foreach( $transients as $transient ){
			delete_transient( str_replace($prefix, '', $transient) );
		}
	}

} //end class
WC_MNM_Variable_Transients::init();