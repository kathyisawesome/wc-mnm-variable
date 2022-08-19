
<?php
/**
 * Template hooks
 *
 * @package  WooCommerce Mix and Match Variable\Functions
 */

defined( 'ABSPATH' ) || exit;

// Add to cart template.
add_action( 'woocommerce_variable-mix-and-match_add_to_cart', 'wc_setup_loop' );
add_action( 'woocommerce_variable-mix-and-match_add_to_cart', 'wc_mnm_variable_template_add_to_cart' );

// Single product template for Mix and Match. Form location: After summary.
add_action( 'woocommerce_after_single_product_summary', 'wc_mnm_variable_template_add_to_cart_after_summary', -1000 );

// Variation contents loop.
add_action( 'wc_mnm_variation_add_to_cart', 'wc_mnm_variation_add_to_cart' );

// Display MNM variation contents.
add_action( 'woocommerce_single_variation', 'wc_mnm_template_single_variation', 15 );
add_action( 'wc_mnm_variation_content_loop', 'wc_mnm_content_loop' );
add_action( 'wc_mnm_variation_content_loop', 'wc_mnm_template_reset_link', 20 );
add_action( 'wc_mnm_variation_content_loop', 'wc_mnm_template_add_to_cart_status', 30 );


//add_action( 'wc_mnm_variation_loop_item', 'woocommerce_show_product_loop_sale_flash', 10 );
//add_action( 'wc_mnm_variation_loop_item', 'woocommerce_template_loop_product_thumbnail', 20 );
//add_action( 'wc_mnm_variation_loop_item', 'woocommerce_template_loop_product_title', 30 );
//add_action( 'wc_mnm_variation_loop_item', 'woocommerce_template_loop_price', 40 );
//add_action( 'wc_mnm_variation_loop_item', 'woocommerce_template_loop_add_to_cart', 50 );

