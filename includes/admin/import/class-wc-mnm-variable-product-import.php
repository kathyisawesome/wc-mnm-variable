<?php
/**
 * Product Import Class
 *
 * @package  WooCommerce Mix and Match Variable Products/Admin/Import
 * @since    1.0.0
 * @version  1.0.0
 */

// Exit if accessed directly.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * WC_MNM_Variable_Product_Import Class.
 *
 * Add support for MNM products to WooCommerce product import.
 */
class WC_MNM_Variable_Product_Import {

	/**
	 * Hook in.
	 */
	public static function init() {

		add_filter( 'woocommerce_product_import_process_item_data', array( __CLASS__, 'import_mix_and_match_variations' ) );

		// Map custom column titles.
		add_filter( 'woocommerce_csv_product_import_mapping_options', array( __CLASS__, 'map_columns' ) );
		add_filter( 'woocommerce_csv_product_import_mapping_default_columns', array( __CLASS__, 'add_columns_to_mapping_screen' ) );

		// Set Variable MnM-type props.
		add_filter( 'woocommerce_product_import_pre_insert_product_object', array( __CLASS__, 'set_variable_mnm_props' ), 10, 2 );

		// Remove props for variations.
		add_filter( 'wc_mnm_import_set_props', array( __CLASS__, 'unset_variation_props' ), 10, 2 );

		
	}

	/**
	 * Filters product import data so mix and match variations are imported correctly (as variations).
	 *
	 * Mix and Match variations are the exact same as standard variations. What sets them apart is the fact they are linked
	 * to a variable mix and match parent rather than a standard variable product. With that in mind, we need to import them just
	 * like a variation.
	 * 
	 * @props WooCommerce Subscriptions
	 *
	 * @param array $data The product's import data.
	 * @return array $data
	 */
	public static function import_mix_and_match_variations( $data ) {
		if ( isset( $data['type'] ) && 'mix-and-match-variation' === $data['type'] ) {
			$data['type'] = 'variation';
		}

		return $data;
	}

	/**
	 * Register the 'Custom' columns in the importer.
	 *
	 * @param  array  $columns
	 * @return array  $columns
	 */
	public static function map_columns( $columns ) {

		$columns['variable-mix-and-match'] = array(
				'name'    => __( 'Variable Mix and Match Products', 'wc-mnm-variable' ),
				'options' => array(
					'wc_mnm_variable_share_contents' => __( 'Variable MnM Share Contents', 'wc-mnm-variable' ),
				)
			);

		return apply_filters( 'wc_mnm_variable_csv_product_import_mapping_options', $columns );

	}

	/**
	 * Add automatic mapping support for custom columns.
	 *
	 * @param  array  $columns
	 * @return array  $columns
	 */
	public static function add_columns_to_mapping_screen( $columns ) {

		$columns[ __( 'Variable MnM Share Contents', 'wc-mnm-variable' ) ] = 'wc_mnm_variable_share_contents';

		// Always add English mappings.
		$columns[ 'Variable MnM Share Contents' ] = 'wc_mnm_variable_share_contents';

		return apply_filters( 'wc_mnm_variable_csv_product_import_mapping_default_columns', $columns );
	}


	/**
	 * Set container-type props.
	 *
	 * @param WC_Product
	 * @param  array  $data
	 * @return array
	 */
	public static function set_variable_mnm_props( $product, $data ) {

		if ( $product instanceof WC_Product && $product->is_type( 'variable-mix-and-match' ) ) {

			$props = apply_filters(
				'wc_mnm_variable_import_set_props',
				array(
					'share_contents'            => isset( $data['wc_mnm_variable_share_contents'] ) ? intval( $data['wc_mnm_variable_share_contents'] ) : 0,
					'content_source'            => isset( $data['wc_mnm_content_source'] ) && '' !== $data['wc_mnm_content_source'] ? strval( $data['wc_mnm_content_source'] ) : 'products',
					'child_category_ids'        => isset( $data['wc_mnm_child_category_ids'] ) && ! empty( $data['wc_mnm_child_category_ids'] ) ? $data['wc_mnm_child_category_ids'] : array(),
					'child_items'               => isset( $data['wc_mnm_child_items'] ) && ! empty( $data['wc_mnm_child_items'] ) ? $data['wc_mnm_child_items'] : array(),
					'packing_mode'              => isset( $data['wc_mnm_packing_mode'] ) && '' !== $data['wc_mnm_packing_mode'] ? strval( $data['wc_mnm_packing_mode'] ) : 'together',
					'weight_cumulative'         => isset( $data['wc_mnm_weight_cumulative'] ) && 1 === intval( $data['wc_mnm_weight_cumulative'] ) ? 'yes' : 'no',
					'priced_per_product'        => isset( $data['wc_mnm_priced_per_product'] ) && 1 === intval( $data['wc_mnm_priced_per_product'] ) ? 'yes' : 'no',
					'discount'                  => isset( $data['wc_mnm_discount'] ) && '' !== $data['wc_mnm_discount'] ? strval( $data['wc_mnm_discount'] ) : '',
					'layout_override'           => isset( $data['wc_mnm_layout_override'] ) && 1 === intval( $data['wc_mnm_layout_override'] ) ? 'yes' : 'no',
					'layout'                    => isset( $data['wc_mnm_layout'] ) && '' !== $data['wc_mnm_layout'] ? strval( $data['wc_mnm_layout'] ) : 'tabular',
					'add_to_cart_form_location' => isset( $data['wc_mnm_add_to_cart_form_location'] ) && '' !== $data['wc_mnm_add_to_cart_form_location'] ? strval( $data['wc_mnm_add_to_cart_form_location'] ) : 'default',
				),
				$product,
				$data
			);

			$product->set_props( $props );
		}

		return $product;
	}

	/**
	 * Remove inherited props.
	 *
	 * @param  array  $props
	 * @param WC_Product
	 * @return array
	 */
	public static function unset_variation_props( $props, $product ) {

		if ( $product && $product->is_type( 'mix-and-match-variation' ) ) {
			unset( $props[ 'packing_mode' ] );
			unset( $props[ 'weight_cumulative' ] );
			unset( $props[ 'priced_per_product' ] );
			unset( $props[ 'discount' ] );  
			unset( $props[ 'layout_override' ] );
			unset( $props[ 'layout' ] );                    
			unset( $props[ 'add_to_cart_form_location' ] ); 
		}

		return $props;

	}

}
WC_MNM_Variable_Product_Import::init();
