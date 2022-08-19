<?php
/**
 * All Products for Subscriptions - Adds support for per-item priced containers
 *
 * @package  WooCommerce Mix and Match Products/Compatibility
 * @since    1.0.0
 * @version  1.0.0
 */

// Exit if accessed directly.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * The Main WC_MNM_Variable_APFS_Compatibility class
 **/
if ( ! class_exists( 'WC_MNM_Variable_APFS_Compatibility' ) ) :

	class WC_MNM_Variable_APFS_Compatibility {

		/**
		 * Hooks for MNM/APFS Per-Item Pricing Compat.
		 */
		public static function add_hooks() {

			// Register mix-and-match-variation as supported type.
			add_filter( 'wcsatt_supported_product_types', [ __CLASS__, 'wcsatt_supported_product_types' ] );

			// Change scheme display location.
			add_filter( 'wcsatt_modify_variation_data_price_html', [ __CLASS__, 'wcsatt_modify_variation_data_price_html' ], 10, 2 );

		}
		
		/**
		 * Product types supported by the plugin.
		 *
		 * @param array $types - The types that support subscriptions.
		 * @return array
		 */
		public static function wcsatt_supported_product_types( $types ) {
			return array_merge( $types, [ 'variable-mix-and-match', 'mix-and-match-variation' ] );
		}


		/**
		 * Force display of schemes to before_add_to_cart_button
		 *
		 * @param bool $modify
		 * @param WC_Product $product
		 * @return bool
		 */
		public static function wcsatt_modify_variation_data_price_html( $modify, $product ) {
			return $product->is_type( [ 'variable-mix-and-match', 'mix-and-match-variation' ] ) ? false : $modify;
		}

	} // End class: do not remove or there will be no more guacamole for you.

endif; // End class_exists check.

WC_MNM_Variable_APFS_Compatibility::add_hooks();