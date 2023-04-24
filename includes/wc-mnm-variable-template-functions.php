
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
		WC_MNM_Variable::get_instance()->load_scripts();

		// Get Available variations?
		$get_variations = count( $product->get_children() ) <= apply_filters( 'woocommerce_ajax_variation_threshold', 30, $product );

		// Load the template.
		wc_get_template(
			'single-product/add-to-cart/variable-mnm.php',
			array(
				'available_variations' => $get_variations ? $product->get_available_variations() : false,
				'attributes'           => $product->get_variation_attributes(),
				'selected_attributes'  => $product->get_default_attributes(),
				'classes'              => wc_mnm_get_form_classes( array( 'variable_mnm_form' ), $product ),
			),
			'',
			WC_MNM_Variable::get_instance()->get_plugin_path() . 'templates/'
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
		$cached_key = 'wc_mnm_variation_add_to_cart_' . $variation->get_cache_key();

		$html = get_transient( $cached_key );

		if( false === $html ) {
			ob_start();
			// Load the template.
			wc_get_template(
				'single-product/add-to-cart/mnm-variation-add-to-cart.php',
				array(
					'variation' => $variation,
				),
				'',
				WC_MNM_Variable::get_instance()->get_plugin_path() . 'templates/'
			);

			$html = ob_get_clean();

			set_transient($cached_key, $html, WEEK_IN_SECONDS);
		}

		echo $html;

	}
}


if ( ! function_exists( 'wc_mnm_template_single_variation' ) ) {

	/**
	 * Output placeholders for the single variation.
	 */
	function wc_mnm_template_single_variation( $product = false ) {

		if ( ! $product ) {
			global $product;
		}

		if ( $product && $product->is_type( 'variable-mix-and-match' ) ) {
			echo '<div class="woocommerce-variation single_mnm_variation"></div>';
		}
	}
}

if ( ! function_exists( 'wc_mnm_variation_header' ) ) {

	/**
	 * Output prompt for the single variation.
	 */
	function wc_mnm_variation_header( $variation ) {
		wc_get_template(
			'single-product/mnm-variation-header.php',
			array(
				'variation' => $variation,
			),
			'',
			WC_MNM_Variable::get_instance()->get_plugin_path() . 'templates/'
		);
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
			WC_MNM_Variable::get_instance()->get_plugin_path() . 'templates/'
		);
	}
}

if ( ! function_exists( 'wc_mnm_template_variation_attribute_options' ) ) {

	/**
	 * Output a list of variation attributes for use in the cart forms.
	 *
	 * @param array $args Arguments.
	 */
	function wc_mnm_template_variation_attribute_options( $args ) {

		$args = wp_parse_args(
			apply_filters( 'wc_mnm_template_variation_attribute_options_args', $args ),
			array(
				'attribute'        => false,
				'product'          => false,
				'selected'         => false,
				'name'             => '',
				'id'               => '',
				'class'            => 'wc-mnm-variations-field',
			)
		);

		// Get selected value.
		if ( false === $args['selected'] && $args['attribute'] && $args['product'] instanceof WC_Product ) {
			$selected_key = 'attribute_' . sanitize_title( $args['attribute'] );
			// phpcs:disable WordPress.Security.NonceVerification.Recommended
			$args['selected'] = isset( $_REQUEST[ $selected_key ] ) ? wc_clean( wp_unslash( $_REQUEST[ $selected_key ] ) ) : $args['product']->get_variation_default_attribute( $args['attribute'] );
			// phpcs:enable WordPress.Security.NonceVerification.Recommended
		}

		$product               = $args['product'];
		$attribute             = $args['attribute'];
		$name                  = $args['name'] ? $args['name'] : 'attribute_' . sanitize_title( $attribute );
		$id                    = $args['id'] ? $args['id'] : sanitize_title( $attribute );
		$class                 = $args['class'];

		$available_variations  = $product ? $product->get_available_variations( 'objects' ) : [];

		if ( ! empty( $available_variations ) ) { ?>

			<fieldset id="<?php echo esc_attr( $id ); ?>" class="<?php echo esc_attr( $class );?>">

				<legend><?php printf( esc_html_x( 'Choose %s', '[Frontend] attribute label', 'wc-mnm-variable' ), wc_attribute_label( $args['attribute'] ) ); ?></legend>

				<ul class="variations wc-mnm-variations <?php echo esc_attr( count( $available_variations ) % 3 === 0 ? 'columns-3' : 'columns-2' ); ?>">

				<?php foreach ( $available_variations as $variation ) : ?>
					
					<li class="variation product-type-mix-and-match-variation">

						<?php
						
						$attributes = $variation->get_variation_attributes( false );
						$value      = reset( $attributes ); // get_attribute() returns the pretty term label, which isn't viable for a value attribute.
						$label      = $variation->get_attribute( $args['attribute'] );
						$input_id   = sanitize_title( $args['attribute'] . '-' . $value );

						// This handles < 2.4.0 bw compatibility where text attributes were not sanitized.
						$checked = sanitize_title( $args['selected'] ) === $args['selected'] ? checked( $args['selected'], sanitize_title( $value ), false ) : checked( $args['selected'], $value, false );	
						?>

						<input id="<?php echo esc_attr( $input_id ); ?>" type="radio" name="<?php echo esc_attr( $name ); ?>" value="<?php echo esc_attr( $value ); ?>" <?php echo $checked; ?> />
						<label for="<?php echo esc_attr( $input_id ); ?>">
						
							<?php
								if ( $variation->get_image_id() ) {
									$image_size = apply_filters( 'single_product_archive_thumbnail_size', 'woocommerce_thumbnail' );
									echo $variation->get_image( $image_size );
								}
							?>

							<span class="variation-title"><?php echo wp_kses_post( $label ); ?></span>

							<span class="variation-price price"><?php echo wp_kses_post( $variation->get_price_html() ); ?></span>
					
						</label>
						
					</li>

				<?php endforeach; ?>

				<?php woocommerce_product_loop_end(); ?>

			</fieldset>

			<?php wp_reset_postdata(); ?>

		<?php } ?>

		<?php

	}
}

/*--------------------------------------------------------*/
/*  Variable Mix and Match edit container template functions       */
/*--------------------------------------------------------*/

if ( ! function_exists( 'wc_mnm_template_edit_variable_container_order_item' ) ) {

	/**
	 * Edit container template for Mix and Match products.
	 * 
	 * @param WC_Product_Mix_and_Match
	 * @param WC_Order_Item $order_item
	 * @param WC_Order $order
	 * @param  string $source The originating source loading this template
	 */
	function wc_mnm_template_edit_variable_container_order_item( $product, $order_item, $order, $source ) {

		global $product;

		if ( $order_item instanceof WC_Order_Item_Product ) {
			// Need to get the parent product object in this case.
			$product = apply_filters( 'woocommerce_order_item_product', wc_get_product( $order_item->get_product_id() ), $order_item );
		}

		if ( ! $product || ! $product->is_type( 'variable-mix-and-match' ) ) {
			return;
		}

		// Merge the variation's attributes into $_REQUEST to pre-select the correct attributes.
		// @todo - Is there a better way to do this?
		$variation = $order_item->get_product();
		
		if ( $variation && $variation->is_type( 'mix-and-match-variation' ) ) {
			$attributes = $variation->get_variation_attributes();
			$_REQUEST = array_merge( $_REQUEST, $variation->get_variation_attributes() );
		}

		// Get Available variations?
		$get_variations = count( $product->get_children() ) <= apply_filters( 'woocommerce_ajax_variation_threshold', 30, $product );
			
		wc_get_template(
			'edit-order-item/edit-variable-container.php',
			array(
				'order_item'           => $order_item,
				'order'                => $order,
				'classes'              => wc_mnm_get_form_classes( array( 'variable_mnm_form', 'edit_container' ), $product ),
				'available_variations' => $get_variations ? $product->get_available_variations(): false,
				'attributes'           => $product->get_variation_attributes(),
				'source'               => $source,
			),
			'',
			WC_MNM_Variable::get_instance()->get_plugin_path() . 'templates/'
		);

	}

}
