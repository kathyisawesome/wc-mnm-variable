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
		'layout_override'           => false,
		'layout'                    => 'tabular',
		'add_to_cart_form_location' => 'default',
		'share_content'             => false,
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
	 * Return all child items
	 * these are the items that are allowed to be in the container
	 *
	 * @return WC_MNM_Child_Item[]
	 */
	public function get_child_items( $context = 'view' ) {

		$container_id = $this->get_parent_id() && $this->is_sharing_content( $context ) ? $this->get_parent_id() : $this->get_id();

		// @todo - how detect if the parent has content changes?
		if ( $container_id && ! $this->has_child_item_changes() ) {
			$this->child_items = WC_MNM_Helpers::cache_get( $container_id, 'child_items' );
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

			WC_Mix_and_Match_Helpers::cache_set( $container_id, $this->child_items, 'child_items' );

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

}


