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
	 * 
	 * @todo - should this be inherited here? Or should we use get_layout() and read from parent_data array? These aren't props we can change at the variation level
	 *
	 * @var array
	 */
	protected $parent_data = array(
		'layout_override'                  => false,
		'layout'                           => 'tabular',
		'add_to_cart_form_location'        => 'default',
		'global_layout'                    => 'tabular',
		'global_add_to_cart_form_location' => 'default',
		'share_content'                    => false,
		'priced_per_product'               => false,
		'discount'                         => 0,
		'packing_mode'                     => 'together',
		'weight_cumulative'                => false,
		'content_source'                   => 'products',
		'child_category_ids'               => [],
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
	 * Get internal type.
	 *
	 * @return string
	 */
	public function get_type() {
		return 'mix-and-match-variation';
	}

	
	/**
	 * Share content getter.
	 *
	 * @param  string $context
	 * @return bool
	 */
	public function get_share_content( $context = 'view' ) {
		$value = wc_string_to_bool( $this->parent_data[ 'share_content' ] );
		return 'view' === $context ? apply_filters( $this->get_hook_prefix() . 'share_content', $value, $this ) : $value;
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
			$value = 'view' === $context ? apply_filters( $this->get_hook_prefix() . 'content_source', $this->parent_data[ 'content_source' ], $this ) : $this->parent_data[ 'content_source' ];
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
			$value = 'view' === $context ? apply_filters( $this->get_hook_prefix() . 'child_category_ids', $this->parent_data[ 'child_category_ids' ], $this ) : $this->parent_data[ 'child_category_ids' ];
		} else {
			$value = $this->get_prop( 'child_category_ids', $context );
		}

		return $value;
	}


		/**
	 * "Form Location" getter.
	 *
	 * @param  string  $context
	 * @return string
	 */
	public function get_add_to_cart_form_location( $context = 'view' ) {
		$value = $this->has_layout_override( $context ) ? $this->parent_data[ 'add_to_cart_form_location' ] : $this->parent_data[ 'global_add_to_cart_form_location' ];
		return 'view' === $context ? apply_filters( $this->get_hook_prefix() . 'add_to_cart_form_location', $layout, $this ) : $layout;
	}

	/**
	 * "Override template" getter.
	 *
	 * @param  string  $context
	 * @return string
	 */
	public function get_layout_override( $context = 'view' ) {
		return 'view' === $context ? apply_filters( $this->get_hook_prefix() . 'layout_override', $this->parent_data[ 'layout_override' ], $this ) : $this->parent_data[ 'layout_override' ];
	}

	/**
	 * "Layout" getter.
	 *
	 * @param  string  $context
	 * @return string
	 */
	public function get_layout( $context = 'view' ) {
		$value = $this->has_layout_override( $context ) ? $this->parent_data[ 'layout' ] : $this->parent_data[ 'global_layout' ];
		return 'view' === $context ? apply_filters( $this->get_hook_prefix() . 'layout', $value, $this ) : $value;
	}

	/**
	 * Packing Mode getter.
	 *
	 * @param  string $context
	 * @return bool
	 */
	public function get_packing_mode( $context = 'view' ) {
		return 'view' === $context ? apply_filters( $this->get_hook_prefix() . 'packing_mode', $this->parent_data[ 'packing_mode' ], $this ) : $this->parent_data[ 'packing_mode' ];
		return $this->get_prop( 'packing_mode', $context );
	}

	/**
	 * Shipping weight cumulative getter.
	 *
	 * @param  string $context
	 * @return string
	 */
	public function get_weight_cumulative( $context = 'view' ) {
		return 'view' === $context ? apply_filters( $this->get_hook_prefix() . 'weight_cumulative', $this->parent_data[ 'weight_cumulative' ], $this ) : $this->parent_data[ 'weight_cumulative' ];
	}

	/*
	|--------------------------------------------------------------------------
	| Setters.
	|--------------------------------------------------------------------------
	*/

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
	 * Returns whether or not the product shares allowed contents or has variation-specific allowed contetns
	 *
	 * @param string $context
	 * @return bool
	 */
	public function is_sharing_content( $context = 'view' ) {
		return $this->get_share_content( $context );
	}

}


