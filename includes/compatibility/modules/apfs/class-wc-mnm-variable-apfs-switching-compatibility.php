<?php
/**
 * All Products for Subscriptions - Handles subscription contents switching
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
 * The Main WC_MNM_Variable_APFS_Switching_Compatibility class
 **/
if ( ! class_exists( 'WC_MNM_Variable_APFS_Switching_Compatibility' ) ) :

	class WC_MNM_Variable_APFS_Switching_Compatibility {

		/**
		 * Runtime cache.
		 *
		 * @var    array
		 */
		private static $cache = array();

		/**
		 * Hooks for MNM support.
		 */
		public static function add_hooks() {

			// Add extra 'Allow Switching' options. See 'WCS_ATT_Admin::allow_switching_options'.
			add_filter( 'woocommerce_subscriptions_allow_switching_options', array( __CLASS__, 'add_container_switching_options' ), 11 );
			// Add variations to switch link.
			add_filter( 'wc_mnm_get_posted_container_form_data', array( __CLASS__, 'get_posted_container_form_data' ), 10, 3 );

		}

		/**
		 * Add extra 'Allow Switching' options for content switching of Mix and Match containers
		 *
		 * @See: 'WCS_ATT_Admin::allow_switching_options'.
		 *
		 * @param  array  $data
		 * @return array
		 */
		public static function add_container_switching_options( $data ) {

			$switch_option_mnm_contents = get_option( WC_Subscriptions_Admin::$option_prefix . '_allow_switching_mnm_variable', '' );

			if ( '' === $switch_option_mnm_contents ) {
				update_option( WC_Subscriptions_Admin::$option_prefix . '_allow_switching_mnm_variable', 'yes' );
			}

			$data[] = array(
				'id'    => 'mnm_variations',
				'label' => __( 'Between Mix and Match Variations', 'wc-mnm-variable' ),
			);

			return $data;
		}


		/**
		 * Add attributes to variation switch link.
		 *
		 * @param  array       $form_data The params that will be used to bbuild siwtch link
		 * @param  array       $configuration The container configuration
		 * @param  WC_Product  $product The container product
		 * @return boolean
		 */
		public static function get_posted_container_form_data( $form_data, $configuration, $container ) {

			if ( $container->is_type( 'mix-and-match-variation' ) ) {

				$attributes = array_filter( $container->get_variation_attributes(), 'wc_array_filter_default_attributes' );

				if ( ! empty( $attributes ) ) {
					$form_data = array_merge( $form_data, $attributes );
				}

			}
		
			return $form_data;
		}


	} // End class: do not remove or there will be no more guacamole for you.

endif; // End class_exists check.

WC_MNM_Variable_APFS_Switching_Compatibility::add_hooks();
