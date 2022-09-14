<?php
/**
 * This trait will have shared calculation logic between WC_Product_Mix_and_Match and WC_Product_Mix_and_Match_Variable product classes.
 *
 * @package WooCommerce Mix and Match Products\Traits
 * @since 3.0.0
 * @version 3.0.0
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Trait WC_MNM_Product.
 *
 * @since 3.0.0
 */
trait WC_MNM_Product {

	/**
	 *  Define type-specific properties.
	 * @var array
	 */
	protected $shared_props = array(
		'layout_override'           => false,
		'layout'                    => 'tabular',
		'add_to_cart_form_location' => 'default',
		'priced_per_product'        => false,
		'packing_mode'              => 'together',
		'weight_cumulative'         => false,
	);
	

	/**
	 * Layout options data.
	 * @see 'WC_Product_Mix_and_Match::get_layout_options()'.
	 * @var array
	 */
	private static $layout_options_data = null;

	/**
	 * Layout locations data.
	 * @see 'WC_Product_Mix_and_Match::get_add_to_cart_form_location_options()'.
	 * @var array
	 */
	private static $layout_locations_data = null;


	/*
	|--------------------------------------------------------------------------
	| Getters.
	|--------------------------------------------------------------------------
	*/

	/**
	 * "Override template" getter.
	 *
	 * @since  2.0.0
	 *
	 * @param  string  $context
	 * @return string
	 */
	public function get_layout_override( $context = 'view' ) {
		return $this->get_prop( 'layout_override', $context );
	}

	/**
	 * "Layout" getter.
	 *
	 * @param  string  $context
	 * @return string
	 */
	public function get_layout( $context = 'view' ) {
		return $this->get_prop( 'layout', $context );
	}

	/**
	 * "Form Location" getter.
	 *
	 * @param  string  $context
	 * @return string
	 */
	public function get_add_to_cart_form_location( $context = 'view' ) {
		return $this->get_prop( 'add_to_cart_form_location', $context );
	}


	/**
	 * Per-Item Pricing getter.
	 *
	 * @since  1.2.0
	 *
	 * @param  string $context
	 * @return bool
	 */
	public function get_priced_per_product( $context = 'view' ) {
		return $this->get_prop( 'priced_per_product', $context );
	}

	/**
	 * Packing Mode getter.
	 *
	 * @param  string $context
	 * @return bool
	 */
	public function get_packing_mode( $context = 'view' ) {
		return $this->get_prop( 'packing_mode', $context );
	}

	/**
	 * Shipping weight cumulative getter.
	 *
	 * @param  string $context
	 * @return string
	 */
	public function get_weight_cumulative( $context = 'view' ) {
		return $this->get_prop( 'weight_cumulative', $context );
	}

	/*
	|--------------------------------------------------------------------------
	| Setters.
	|--------------------------------------------------------------------------
	*/

	/**
	 * "Override template" setter.
	 *
	 * @since  2.0.0
	 *
	 * @param  string  $value
	 */
	public function set_layout_override( $value ) {
		$this->set_prop( 'layout_override', wc_string_to_bool( $value ) );
	}

	/**
	 * "Form Location" setter.
	 *
	 * @since  1.3.0
	 *
	 * @param  string  $location
	 */
	public function set_add_to_cart_form_location( $location ) {
		$location = $location && array_key_exists( $location, self::get_add_to_cart_form_location_options() ) ? $location : 'default';
		$this->set_prop( 'add_to_cart_form_location', $location );
	}


	/**
	 * "Layout" setter.
	 *
	 * @since  1.3.0
	 *
	 * @param  string  $layout
	 */
	public function set_layout( $layout ) {
		$layout = $layout && array_key_exists( $layout, self::get_layout_options() ) ? $layout : 'tabular';
		$this->set_prop( 'layout', $layout );
	}


	/**
	 * Per-Item Pricing setter.
	 *
	 * @since  1.2.0
	 *
	 * @param  string  $value
	 */
	public function set_priced_per_product( $value ) {
		$this->set_prop( 'priced_per_product', wc_string_to_bool( $value ) );
	}


	/**
	 * Packing Mode setter.
	 *
	 * @since  2.0.0
	 *
	 * @param  string  $value 'virtual' | 'together' | 'separate' | 'separate_plus'
	 *    'virtual'       - Everything is virtual.
	 *    'together'      - Packed as a single unit.
	 *    'separate'      - Packed separately, no physical container.
	 *    'separate_plus' - Packed separately, with physical container.
	 */
	public function set_packing_mode( $value ) {
		$value = $value && in_array( $value, array( 'virtual', 'together', 'separate', 'separate_plus' ) ) ? $value : 'together';
		$this->set_prop( 'packing_mode', $value );
	}


	/**
	 * Shipping weight calculation setter.
	 *
	 * @since  2.0.0
	 *
	 * @param  string $value
	 */
	public function set_weight_cumulative( $value ) {
		$this->set_prop( 'weight_cumulative', wc_string_to_bool( $value ) );
	}


	/*
	|--------------------------------------------------------------------------
	| Conditionals
	|--------------------------------------------------------------------------
	*/

	/**
	 *
	 * Does this product have a layout override
	 *
	 * @param  string  $context
	 *
	 * @return bool
	 */
	public function has_layout_override( $context = 'view' ) {
		return $this->get_layout_override( $context );
	}


	/**
	 * Returns whether or not the product container's price is based on the included items.
	 *
	 * @param string $context
	 * @return bool
	 */
	public function is_priced_per_product( $context = 'view' ) {

		$is_priced_per_product = $this->get_priced_per_product();

		/**
		 * `wc_mnm_container_is_priced_per_product` filter
		 *
		 * @param  bool $is_purchasable
		 * @param  obj WC_Product_Mix_and_Match $this
		 */
		return 'view' === $context ? apply_filters( 'wc_mnm_container_is_priced_per_product', $is_priced_per_product, $this ) : $is_priced_per_product;
	}


	/**
	 * Returns whether or not the product container's price is based on the included items.
	 *
	 * @since  1.4.0
	 *
	 * @param string $context
	 * @return bool
	 */
	public function has_discount( $context = 'view' ) {

		$has_discount = $this->get_priced_per_product() && $this->get_discount() > 0;

		/**
		 * `wc_mnm_container_has_discount` filter
		 *
		 * @param  bool $has_discount
		 * @param  obj WC_Product_Mix_and_Match $this
		 */
		return 'view' === $context ? apply_filters( 'wc_mnm_container_has_discount', $has_discount, $this ) : $has_discount;
	}


	/**
	 * Returns whether or not the child products are shipped as a single unit.
	 *
	 * @since 2.0.0
	 *
	 * @param  string  $context
	 * @return bool
	 */
	public function is_packed_together( $context = 'view' ) {

		$packed_together = in_array( $this->get_packing_mode( $context ), array( 'virtual', 'together' ) );

		if ( 'view' === $context && has_filter( 'woocommerce_mnm_shipped_per_product' ) ) {

			wc_deprecated_function( 'woocommerce_mnm_shipped_per_product', '2.0.0', 'wc_mnm_container_is_packed_together (NB: packed_together is the opposite of shipped_per_product)' );

			/**
			 * @param  bool $is_shipped_per_product
			 * @param  obj WC_Product_Mix_and_Match $this
			 */
			$packed_together = ! apply_filters( 'woocommerce_mnm_shipped_per_product', ! $packed_together, $this );
		}

		/**
		 * 'wc_mnm_container_is_packed_together' filter.
		 *
		 * @param  bool $is_packed_together
		 * @param  obj WC_Product_Mix_and_Match $this
		 */
		return 'view' === $context ? apply_filters( 'wc_mnm_container_is_packed_together', $packed_together, $this ) : $packed_together;
	}


	/**
	 * Returns whether or not the product container's shipping weight is cumulative.
	 *
	 * @since  2.0.0
	 *
	 * @param  string  $context
	 * @return bool
	 */
	public function is_weight_cumulative( $context = 'view' ) {

		$is_weight_cumulative = $this->needs_shipping() && $this->is_packed_together() && $this->get_weight_cumulative();
		/**
		 * 'wc_mnm_container_is_weight_cumulative' filter.
		 *
		 * @param  bool $is_weight_cumulative
		 * @param  obj WC_Product_Mix_and_Match $this
		 */
		return 'view' === $context ? apply_filters( 'wc_mnm_container_is_weight_cumulative', $is_weight_cumulative, $this ) : $is_weight_cumulative;
	}

	/*
	|--------------------------------------------------------------------------
	| Static methods.
	|--------------------------------------------------------------------------
	*/

	/**
	 * Supported "Form Location" options.
	 *
	 * @return array {
	 *     @type string       $label        The translatable label for the icon.
	 *     @type string       $description  Text to display a longer decsription of the icon. Optional.
	 *     @type string       $image        URL to option icon.
	 * }
	 */
	public static function get_add_to_cart_form_location_options() {

		if ( is_null( self::$layout_locations_data ) ) {

			self::$layout_locations_data = array(
				'default'      => array(
					'label'       => __( 'Inline', 'woocommerce-mix-and-match-products', 'wc-mnm-variable' ),
					'description' => __( 'The add-to-cart form is displayed inside the single-product summary.', 'woocommerce-mix-and-match-products', 'wc-mnm-variable' ),
					'image'       => WC_Mix_and_Match()->plugin_url() . '/assets/images/location-inline.svg',
				),
				'after_summary' => array(
					'label'       => __( 'Full-width', 'woocommerce-mix-and-match-products', 'wc-mnm-variable' ),
					'description' => __( 'The add-to-cart form is displayed after the single-product summary. Usually allocates the entire page width for displaying form content. Note that some themes may not support this option.', 'woocommerce-mix-and-match-products', 'wc-mnm-variable' ),
					'image'       => WC_Mix_and_Match()->plugin_url() . '/assets/images/location-full.svg',
				)
			);

			self::$layout_locations_data = apply_filters( 'wc_mnm_add_to_cart_form_location_options', self::$layout_locations_data );

		}

		return self::$layout_locations_data;
	}

	/**
	 * Supported layouts.
	 *
	 * @return array {
	 *     @type string       $label        The translatable label for the icon.
	 *     @type string       $description  Text to display a longer decsription of the icon. Optional.
	 *     @type string       $image        URL to option icon.
	 * }
	 */
	public static function get_layout_options() {

		if ( is_null( self::$layout_options_data ) ) {

			self::$layout_options_data = array(
				'tabular' => array(
					'label'       => esc_html__( 'List', 'woocommerce-mix-and-match-products', 'wc-mnm-variable' ),
					'description' => esc_html__( 'The allowed contents are displayed as a list.', 'woocommerce-mix-and-match-products', 'wc-mnm-variable' ),
					'image'       => WC_Mix_and_Match()->plugin_url() . '/assets/images/layout-list.svg',
					'mb_display'  => false, // In the product metabox, this icon is in the admin font. Set to true to print the svg directly.
				),
				'grid' => array(
					'label'       => esc_html__( 'Grid', 'woocommerce-mix-and-match-products', 'wc-mnm-variable' ),
					'description' => esc_html__( 'The allowed contents are displayed as a grid.', 'woocommerce-mix-and-match-products', 'wc-mnm-variable' ),
					'image'       => WC_Mix_and_Match()->plugin_url() . '/assets/images/layout-grid.svg',
					'mb_display'  => false,
				)
			);

			self::$layout_options_data = apply_filters( 'wc_mnm_supported_layouts', self::$layout_options_data );

		}
		return self::$layout_options_data;
	}

}
