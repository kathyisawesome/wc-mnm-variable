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
		'share_content'                    => true,
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
	 * @param  string  $context
	 * @return string
	 */
	public function get_add_to_cart_form_location( $context = 'view' ) {
		$value = $this->has_layout_override( $context ) ? $this->parent_data['add_to_cart_form_location'] : $this->parent_data['global_add_to_cart_form_location'];

		// Since the global value _can_ be false, we need a fallback for new installs.
		$value = $value ? $value : $this->get_prop( 'add_to_cart_form_location', 'edit' );

		return 'view' === $context ? apply_filters( $this->get_hook_prefix() . 'add_to_cart_form_location', $value, $this ) : $value;
	}

	/**
	 * "Override template" getter.
	 *
	 * @param  string  $context
	 * @return string
	 */
	public function get_layout_override( $context = 'view' ) {
		$value = wc_string_to_bool( $this->parent_data['layout_override'] );
		return 'view' === $context ? apply_filters( $this->get_hook_prefix() . 'layout_override', $value, $this ) : $value;
	}

	/**
	 * "Layout" getter.
	 *
	 * @param  string  $context
	 * @return string
	 */
	public function get_layout( $context = 'view' ) {
		$value = $this->has_layout_override( $context ) ? $this->parent_data['layout'] : $this->parent_data['global_layout'];

		// Since the global value _can_ be false, we need a fallback for new installs.
		$value = $value ? $value : $this->get_prop( 'layout', 'edit' );

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

	/**
	 * Return all child items
	 * these are the items that are allowed to be in the container
	 * 
	 * For variations, if sharing content, cache the result on the parent so it runs 1x.
	 *
	 * @return WC_MNM_Child_Item[]
	 */
	public function get_child_items( $context = 'view' ) {

		$cache_id = $this->is_sharing_content( $context ) ? $this->get_parent_id() : $this->get_id();

		if ( $this->get_id() && ! $this->has_child_item_changes() ) {
			$this->child_items = WC_MNM_Helpers::cache_get( $cache_id, 'child_items' );
		}

		if ( null === $this->child_items ) {

			$this->child_items = [];

			$child_items = $this->data_store->read_child_items( $this );

			// Sanity check that the products do exist.
			foreach ( $child_items as $item_key => $child_item ) {

				if ( $child_item && $child_item->exists() ) {

					if ( ! $child_item->is_visible() ) {
						continue;
					}

					$this->child_items[ $item_key ] = $child_item;

				}

			}

			WC_Mix_and_Match_Helpers::cache_set( $cache_id, $this->child_items, 'child_items' );

		}

		/**
		 * 'wc_mnm_child_items' filter.
		 *
		 * @param  WC_MNM_Child_Item[]       $child_items
		 * @param  WC_Product_Mix_and_Match  $this
		 */
		return 'view' === $context ? apply_filters( 'wc_mnm_child_items', $this->child_items, $this ) : $this->child_items;

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


