<?php
/**
 * Variable product add to cart
 *
 * This template can be overridden by copying it to yourtheme/woocommerce/single-product/add-to-cart/variable-mnm.php.
 *
 * HOWEVER, on occasion WooCommerce will need to update template files and you
 * (the theme developer) will need to copy the new files to your theme to
 * maintain compatibility. We try to do this as little as possible, but it does
 * happen. When this occurs the version of the template file will be bumped and
 * the readme will list any important changes.
 *
 * @see https://docs.woocommerce.com/document/template-structure/
 * @package WC Variable Mix and Match\Templates
 * @version 1.0.0
 */

defined( 'ABSPATH' ) || exit;

global $product;

$attribute_keys  = array_keys( $attributes );
$variations_json = wp_json_encode( $available_variations );
$variations_attr = function_exists( 'wc_esc_json' ) ? wc_esc_json( $variations_json ) : _wp_specialchars( $variations_json, ENT_QUOTES, 'UTF-8', true );

do_action( 'woocommerce_before_add_to_cart_form' ); ?>

<form class="<?php echo esc_attr( implode( ' ', $classes ) ); ?>" action="<?php echo esc_url( apply_filters( 'woocommerce_add_to_cart_form_action', $product->get_permalink() ) ); ?>" method="post" enctype='multipart/form-data' data-product_id="<?php echo absint( $product->get_id() ); ?>" data-product_variations="<?php echo $variations_attr; // WPCS: XSS ok. ?>">
	<?php do_action( 'woocommerce_before_variations_form' ); ?>

	<?php if ( empty( $available_variations ) && false !== $available_variations ) : ?>
		<p class="stock out-of-stock"><?php echo esc_html( apply_filters( 'woocommerce_out_of_stock_message', __( 'This product is currently out of stock and unavailable.', 'woocommerce', 'wc-mnm-variable' ) ) ); ?></p>
	<?php else : ?>

		<?php if ( count( $attributes ) === 1 && count( $available_variations ) <= apply_filters( 'wc_mnm_variation_swatches_threshold', 3, $product ) ) :?>

			<div class="variations wc-mnm-variations">

				<?php wc_setup_loop( ['columns' => 3 ] ); ?>
				<?php woocommerce_product_loop_start(); ?>

				<?php foreach ( $product->get_available_variations( 'objects' ) as $variation ) : ?>
					
					<li class="product product-type-mix-and-match-variation <?php echo esc_attr( wc_get_loop_class() );?>">

						<?php  // @todo - move to a template with hook?
						$attributes = $variation->get_variation_attributes( false ); 
						$value = reset( $attributes );
						$attribute = key( $attributes );
						
						// Get selected value.
						$checked_key = 'attribute_' . sanitize_title( $attribute );
						// phpcs:disable WordPress.Security.NonceVerification.Recommended
						$checked = isset( $_REQUEST[ $checked_key ] ) ? wc_clean( wp_unslash( $_REQUEST[ $checked_key ] ) ) : $product->get_variation_default_attribute( $attribute );
						// phpcs:enable WordPress.Security.NonceVerification.Recommended					
						?>

						<input id="<?php echo esc_attr( sanitize_title( $attribute . '-' . $value ) ); ?>" type="radio" name="attribute_<?php echo esc_attr( $attribute ) ?>" data-attribute_name="attribute_<?php echo esc_attr( sanitize_title( $attribute ) );?>" value="<?php echo esc_attr( $value ); ?>" <?php checked( sanitize_title( $checked ), $value ); ?> />
						<label for="<?php echo esc_attr( sanitize_title( $attribute . '-' . $value ) ); ?>">
						
						<?php if ( $variation->get_image_id() ) {
								$image_size = apply_filters( 'single_product_archive_thumbnail_size', 'woocommerce_thumbnail' );
								echo $variation->get_image( $image_size );
						} ?>

						<?php echo wp_kses_post( wc_get_formatted_variation( $variation ) ); ?>

						<?php echo wp_kses_post( $variation->get_price_html() ); ?>
							<button type="button"><?php echo wp_kses_post( $product->add_to_cart_text() ); ?></button>
						</label>
						
					</li>

				<?php endforeach; ?>

				<?php woocommerce_product_loop_end(); ?>

				<?php echo wp_kses_post( apply_filters( 'woocommerce_reset_variations_link', '<a class="reset_variations" href="#">' . esc_html__( 'Clear', 'woocommerce', 'wc-mnm-variable' ) . '</a>' ) ); ?>

			</div>

			<?php wp_reset_postdata(); ?>

		<?php else: ?>
		<table class="variations" cellspacing="0" role="presentation">
			<tbody>
				<?php foreach ( $attributes as $attribute_name => $options ) : ?>
					<tr>
						<th class="label"><label for="<?php echo esc_attr( sanitize_title( $attribute_name ) ); ?>"><?php echo wc_attribute_label( $attribute_name ); // WPCS: XSS ok. ?></label></th>
						<td class="value">
							<?php
								wc_dropdown_variation_attribute_options(
									array(
										'options'   => $options,
										'attribute' => $attribute_name,
										'product'   => $product,
									)
								);
								echo end( $attribute_keys ) === $attribute_name ? wp_kses_post( apply_filters( 'woocommerce_reset_variations_link', '<a class="reset_variations" href="#">' . esc_html__( 'Clear', 'woocommerce', 'wc-mnm-variable' ) . '</a>' ) ) : '';
							?>
						</td>
					</tr>
				<?php endforeach; ?>
			</tbody>
		</table>
		<?php do_action( 'woocommerce_after_variations_table' ); ?>

		<?php endif; ?>

		<div class="single_variation_wrap">
			<?php
				/**
				 * Hook: woocommerce_before_single_variation.
				 */
				do_action( 'woocommerce_before_single_variation' );

				/**
				 * Hook: woocommerce_single_variation. Used to output the cart button and placeholder for variation data.
				 *
				 * @since 2.4.0
				 * @hooked woocommerce_single_variation - 10 Empty div for variation data.
				 * @hooked woocommerce_single_variation_add_to_cart_button - 20 Qty and cart button.
				 */
				do_action( 'woocommerce_single_variation' );

				/**
				 * Hook: woocommerce_after_single_variation.
				 */
				do_action( 'woocommerce_after_single_variation' );
			?>
		</div>
	<?php endif; ?>

	<?php do_action( 'woocommerce_after_variations_form' ); ?>
</form>

<?php
do_action( 'woocommerce_after_add_to_cart_form' );
