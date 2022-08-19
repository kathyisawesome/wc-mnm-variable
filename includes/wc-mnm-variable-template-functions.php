
<?php
/**
 * Template functions
 *
 * Functions for the templating system.
 *
 * @package  WooCommerce Mix and Match Variable\Functions
 * @version  2.5.0
 */

defined( 'ABSPATH' ) || exit;

if ( ! function_exists( 'wc_mnm_variable_template_add_to_cart' ) ) {

    /**
     * Output the variable mix and match product add to cart area.
     * 
     * @param WC_Product_Variable_Mix_and_Match $custom_product - Optionally call template for a specific product.
     */
    function wc_mnm_variable_template_add_to_cart( $custom_product = false ) {

        global $product;
        $backup_product = $product;
    
        if ( is_numeric( $custom_product ) ) {
            $custom_product = wc_get_product( intval( $custom_product ) );
        }
    
        // Swap the global product for this specific product.
        if ( $custom_product ) {
            $product = $custom_product;
        }
    
        if ( ! $product || ! $product->is_type( 'variable-mix-and-match' ) ) {
            return;
        }

        if ( doing_action( 'woocommerce_single_product_summary' ) ) {
            if ( 'after_summary' === $product->get_add_to_cart_form_location() ) {
                return;
            }
        }

        // Enqueue variation scripts.
        WC_MNM_Variable_Mix_and_Match::get_instance()->load_scripts();

        // Get Available variations?
        $get_variations = count( $product->get_children() ) <= apply_filters( 'woocommerce_ajax_variation_threshold', 30, $product );

		$classes = array(
			'variations_form',
			'variable_mnm_form',
			'mnm_form',
			'cart',
			'cart_group',
			'layout_' . $product->get_layout(),
		);
	
		/**
		 * Form classes.
		 *
		 * @param array - The classes that will print in the <form> tag.
		 * @param obj $product WC_Product_Variable_Mix_And_Match of parent product
		 */
		$classes = (array) apply_filters( 'wc_mnm_form_wrapper_classes', $classes, $product );

        // Load the template.
        wc_get_template(
            'single-product/add-to-cart/variable-mnm.php',
            array(
                'available_variations' => $get_variations ? $product->get_available_variations() : false,
                'attributes'           => $product->get_variation_attributes(),
                'selected_attributes'  => $product->get_default_attributes(),
				'classes'              => $classes,
            ),
            '',
            WC_MNM_Variable_Mix_and_Match::get_instance()->get_plugin_path() . 'templates/'
        );

        // Restore product object.
	    $product = $backup_product;

    }
}

if ( ! function_exists( 'wc_mnm_variable_template_add_to_cart_after_summary' ) ) {

	/**
	 * Add-to-cart template for Mix and Match. Handles the 'Form location > After summary' case.
	 */
	function wc_mnm_variable_template_add_to_cart_after_summary() {

		global $product;

		if ( $product->is_type( 'variable-mix-and-match' ) && 'after_summary' === $product->get_add_to_cart_form_location() ) {
			$classes = implode( ' ', apply_filters( 'wc_mnm_form_wrapper_classes', array( 'summary-add-to-cart-form', 'summary-add-to-cart-form-mnm' ), $product ) ); ?>
			<div class="<?php echo esc_attr( $classes ); ?>">
				<?php do_action( 'woocommerce_variable-mix-and-match_add_to_cart' ); ?>
			</div>
			<?php
		}
	}
}


if ( ! function_exists( 'wc_mnm_variation_add_to_cart' ) ) {

    /**
     * Output the mix and match variation's options to add to cart area.
     * 
     * @param WC_Product_Mix_and_Match_Variation $variation
     */
    function wc_mnm_variation_add_to_cart( $variation ) {
   
        if ( ! $variation || ! $variation->is_type( 'mix-and-match-variation' ) ) {
            return;
        }

        /* @todo eventually support full-width form location.
        if ( doing_action( 'woocommerce_single_product_summary' ) ) {
            if ( 'after_summary' === $product->get_add_to_cart_form_location() ) {
                return;
            }
        }
        */

        // Load the template.
        wc_get_template(
            'single-product/add-to-cart/mnm-variation-add-to-cart.php',
            array(
				'variation' => $variation,
            //    'available_variations' => $get_variations ? $product->get_available_variations() : false,
            //    'available_variations' =>false, // @todo for testing
            //    'attributes'           => $product->get_variation_attributes(),
            //    'selected_attributes'  => $product->get_default_attributes(),
            //    'mix_and_match_html'   => $product->is_sharing_content() ? WC_MNM_Variable_Mix_and_Match::get_instance()->get_template_html( $product ) : '', // @todo fetch form if sharing contents.
            ),
            '',
            WC_MNM_Variable_Mix_and_Match::get_instance()->get_plugin_path() . 'templates/'
        );

    }
}


if ( ! function_exists( 'wc_mnm_template_single_variation' ) ) {

	/**
	 * Output placeholders for the single variation.
	 */
	function wc_mnm_template_single_variation() {
		echo '<div class="woocommerce-variation single_mnm_variation"></div>';
	}
}

if ( ! function_exists( 'wc_mnm_template_variation_add_to_cart_button' ) ) {

	/**
	 * Output the add to cart button for variations.
	 * 
	 * @param WC_Product_Mix_and_Match_Variation $variation
	 */
	function wc_mnm_template_variation_add_to_cart_button( $variation ) {
		wc_get_template(
            'single-product/add-to-cart/mnm-variation-add-to-cart-button.php',
            array(
				'variation' => $variation,
			),
            '',
            WC_MNM_Variable_Mix_and_Match::get_instance()->get_plugin_path() . 'templates/'
        );
	}
}

	/**
	 * Display child options.
	 */
	function kia_add_to_cart_template() {

		global $product;

		$selection     = get_query_var( 'mnm' );
		$has_selection = in_array( intval( $selection ), $product->get_children() );


		$transient_name    = 'wc_mnm_grouped_product_loop_' . md5( json_encode( $product->get_children() ) );
		$transient_version = \WC_Cache_Helper::get_transient_version( 'product_query' );
		$cache             = true;
		$transient_value   = $cache ? get_transient( $transient_name ) : false;

		$transient_value = array();

		if ( isset( $transient_value['value'], $transient_value['version'] ) && $transient_value['version'] === $transient_version ) {
			$products = $transient_value['value'];
		} else {
			$products = array_map( 'wc_get_product', $product->get_children() );


			if ( $cache ) {
				$transient_value = array(
					'version' => $transient_version,
					'value'   => $products,
				);
		//		set_transient( $transient_name, $transient_value, DAY_IN_SECONDS * 30 );
			}
		}

		// Set global loop values.
		wc_set_loop_prop( 'name', 'grouped-mnm' );
		wc_set_loop_prop( 'columns', apply_filters( 'wc_grouped_mnm_columns', 3 ) );

		if ( $products ) {

			add_filters();

			if ( $products ) {
				wc_get_template(
					'single-product/add-to-cart/grouped-mnm.php',
					array(
						'grouped_product'  => $product,
						'grouped_products' => $products,
						'selection'        => $selection,
						'has_selection'    => $has_selection,
					),
					'',
					get_plugin_path() . '/templates/'
				);
			}

			remove_filters();

		}

	}


    	/**
	 * Insert the opening anchor tag for products in the loop.
	 */
	function loop_product_link_open() {
		global $product;

		$link = apply_filters( 'woocommerce_loop_product_link', get_the_permalink(), $product );

		$classes = (array) apply_filters( 'wc_mnm_grouped_selector_loop_classes', array( 'woocommerce-LoopProduct-link', 'woocommerce-loop-product__link' ), $product );
		
		echo '<a href="' . esc_url( $link ) . '" data-product_id="' . esc_attr( $product->get_id() ) . '" class="' . esc_attr( implode( ' ', $classes ) )    . '">';
	}


	/**
	 * Filters the list of CSS class names for the current post.
	 *
	 * @since 2.7.0
	 *
	 * @param string[] $classes An array of post class names.
	 * @param string[] $class   An array of additional class names added to the post.
	 * @param int      $post_id The post ID.
	 */
	function selected_post_class( $classes, $class, $post_id ) {
		if ( intval( get_query_var( 'mnm' ) ) === $post_id ) {
			$classes[] = 'selected';
		}
		return $classes;
	}