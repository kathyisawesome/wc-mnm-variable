<?php
/**
 * Mix and Match Product Variation
 *
 * The WooCommerce product variation class handles product variation data.
 *
 * @package Mix and Match Products\Classes
 * @since 1.0.0
 * @version 1.0.0
 */

defined( 'ABSPATH' ) || exit;

class WC_Product_Mix_and_Match_Variation extends WC_Product_Variation {

	use WC_MNM_Container;
	use WC_MNM_Container_Child_Items;

	/**
	 * Inherited parent properties.
	 * NB: Because of how set_parent_data() works in the data store, we use this in our own setter instead.
	 *
	 * @var array
	 */
	protected $extended_parent_data = array(
		'layout_override'           => false,
		'layout'                    => 'tabular',
		'add_to_cart_form_location' => 'default',
		'share_content'             => true,
		'priced_per_product'        => false,
		'discount'                  => 0,
		'packing_mode'              => 'together',
		'weight_cumulative'         => false,
		'content_source'            => 'products',
		'child_category_ids'        => [],
	);

	/**
	 * __construct function.
	 *
	 * @param  mixed $product
	 */
	public function __construct( $product ) {
		// @todo: Do we need to merge parent_data here.
		$this->data = array_merge( $this->data, $this->container_props );
		parent::__construct( $product );
	}

	/**
	 * Returns whether or not the product has additional options that need
	 * selecting before adding to cart.
	 *
	 * @return boolean
	 */
	public function has_options() {
		return apply_filters( 'woocommerce_product_has_options', true, $this );
	}

	/**
	 * Get internal type.
	 *
	 * @return string
	 */
	public function get_type() {
		return 'mix-and-match-variation';
	}

	/**
	 * Cache key.
	 *
	 * @return string
	 */
	public function get_cache_key() {

		$key = $this->get_parent_id() . '_variation:' . $this->get_id();

		if ( 'categories' === $this->get_content_source() ) {
			$key .= '-cats:' . implode( '|', $this->get_child_category_ids() );
		}

		return $key;
	}
	
	
	/**
	 * Share content getter.
	 *
	 * @param  string $context
	 * @return bool
	 */
	public function get_share_content( $context = 'view' ) {
		return true;
	}


	/**
	 * Child items content source getter.
	 *
	 * @param  string $context
	 * @return string
	 */
	public function get_content_source( $context = 'view' ) {

		// Inherit value from parent if sharing content.
		if ( $this->is_sharing_content( $context ) ) {
			$value = 'view' === $context ? apply_filters( $this->get_hook_prefix() . 'content_source', $this->parent_data['content_source'], $this ) : $this->parent_data['content_source'];
		} else {
			$value = $this->get_prop( 'content_source', $context );
		}

		return $value;
	}


	/**
	 * Category contents getter.
	 *
	 * @param  string $context
	 * @return array
	 */
	public function get_child_category_ids( $context = 'view' ) {

		// Inherit value from parent if sharing content.
		if ( $this->is_sharing_content( $context ) ) {
			$value = 'view' === $context ? apply_filters( $this->get_hook_prefix() . 'child_category_ids', $this->parent_data['child_category_ids'], $this ) : $this->parent_data['child_category_ids'];
		} else {
			$value = $this->get_prop( 'child_category_ids', $context );
		}

		return $value;
	}

	/**
	 * "Form Location" getter.
	 * 
	 * NB: This is for parity and API support, but not used for display.
	 *
	 * @param  string  $context
	 * @return string
	 */
	public function get_add_to_cart_form_location( $context = 'view' ) {
		$value = $this->parent_data['add_to_cart_form_location'];
		return 'view' === $context ? apply_filters( $this->get_hook_prefix() . 'add_to_cart_form_location', $value, $this ) : $value;
	}


	/**
	 * "Override template" getter.
	 *
	 * Not supported at the variation level.
	 *
	 * @return bool
	 */
	public function get_layout_override() {
		return false;
	}

	/**
	 * "Layout" getter.
	 * 
	 * NB: This is for parity and API support, but not used for display.
	 *
	 * @param  string  $context
	 * @return string
	 */
	public function get_layout( $context = 'view' ) {
		$value = $this->parent_data['layout'];
		return 'view' === $context ? apply_filters( $this->get_hook_prefix() . 'layout', $value, $this ) : $value;
	}

	/**
	 * Packing Mode getter.
	 *
	 * @param  string $context
	 * @return bool
	 */
	public function get_packing_mode( $context = 'view' ) {
		return 'view' === $context ? apply_filters( $this->get_hook_prefix() . 'packing_mode', $this->parent_data['packing_mode'], $this ) : $this->parent_data['packing_mode'];
		return $this->get_prop( 'packing_mode', $context );
	}

	/**
	 * Shipping weight cumulative getter.
	 *
	 * @param  string $context
	 * @return string
	 */
	public function get_weight_cumulative( $context = 'view' ) {
		$value = wc_string_to_bool( $this->parent_data['weight_cumulative'] );
		return 'view' === $context ? apply_filters( $this->get_hook_prefix() . 'weight_cumulative', $value, $this ) : $value;
	}

	/*
	|--------------------------------------------------------------------------
	| Setters.
	|--------------------------------------------------------------------------
	*/

	/**
	 * Set additional parent data array for this variation.
	 * 
	 * There's not really a way to merge our defaults with the WC_Product_Variation defaults so let's create our own setter.
	 *
	 * @param array $parent_data parent data array for this variation.
	 */
	public function set_extended_parent_data( $parent_data ) {

		// Set some of our own custom defaults.
		$extended_parent_data = wp_parse_args( $parent_data, $this->extended_parent_data );

		$this->parent_data = array_merge( $this->parent_data, $extended_parent_data );
	}

	/**
	 * Shared contents setter.
	 *
	 * @param  string $value
	 * @return string
	 */
	public function set_share_content( $value ) {
		$this->set_prop( 'share_content', wc_string_to_bool( $value ) );
 	}


	/*
	|--------------------------------------------------------------------------
	| Conditionals
	|--------------------------------------------------------------------------
	*/

	/**
	 * Checks the product type to see if it is either this product's type or the parent's
	 * product type.
	 *
	 * @access public
	 * @param mixed $type Array or string of types
	 * @return bool
	 */
	public function is_type( $type ) {
		if ( 'variation' == $type || ( is_array( $type ) && in_array( 'variation', $type ) ) ) {
			return true;
		} else {
			return parent::is_type( $type );
		}
	}

	/**
	 *
	 * Does this product have a layout override
	 *
	 * Not supported at the variation level.
	 *
	 * @return bool
	 */
	public function has_layout_override() {
		return false;
	}

	/**
	 * Returns whether or not the product shares allowed contents or has variation-specific allowed contetns
	 *
	 * @param string $context
	 * @return bool
	 */
	public function is_sharing_content( $context = 'view' ) {
		return $this->get_share_content( $context );
	}


	/**
	 * Checks if this particular variation is visible. Invisible variations are enabled and can be selected, but no price / stock info is displayed.
	 * Instead, a suitable 'unavailable' message is displayed.
	 * Invisible by default: Disabled variations and variations with an empty price AND no child items.
	 *
	 * @return bool
	 */
	public function variation_is_visible() {
		return apply_filters( 'woocommerce_variation_is_visible', 'publish' === get_post_status( $this->get_id() ) && '' !== $this->get_price() && $this->has_child_items(), $this->get_id(), $this->get_parent_id(), $this );
	}

}


