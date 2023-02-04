<?php
/**
 * The template for displaying mix and match allowed pproduct content within loops for variations.
 *
 * This template can be overridden by copying it to yourtheme/woocommerce/single-product/add-to-cart/content-mnm-variation.php.
 *
 * HOWEVER, on occasion WooCommerce will need to update template files and you
 * (the theme developer) will need to copy the new files to your theme to
 * maintain compatibility. We try to do this as little as possible, but it does
 * happen. When this occurs the version of the template file will be bumped and
 * the readme will list any important changes.
 *
 * @see     https://docs.woocommerce.com/document/template-structure/
 * @package WC Variable Mix and Match\Templates
 * @version 1.0.0
 */

defined( 'ABSPATH' ) || exit;

global $product;

// Ensure visibility.
if ( empty( $product ) || ! $product->is_visible() ) {
	return;
}
?>
<li <?php wc_product_class( '', $product ); ?>>
	<?php
	
	/**
	 * 'wc_mnm_variation_loop_item' action.
	 *
	 * @param WC_Product_Mix_and_Match_Variation $variation
	 *
	 * @hooked wc_mnm_category_caption - -10
	 * @hooked wc_mnm_template_child_item_details_wrapper_open  -   0
	 * @hooked wc_mnm_template_child_item_thumbnail_open        -  10
	 * @hooked wc_mnm_template_child_item_thumbnail             -  20
	 * @hooked wc_mnm_template_child_item_section_close         -  30
	 * @hooked wc_mnm_template_child_item_details_open          -  40
	 * @hooked wc_mnm_template_child_item_title                 -  50
	 * @hooked wc_mnm_template_child_item_attributes            -  60
	 * @hooked wc_mnm_template_child_item_section_close         -  70
	 * @hooked wc_mnm_template_child_item_quantity_open         -  80
	 * @hooked wc_mnm_template_child_item_quantity              -  90
	 * @hooked wc_mnm_template_child_item_section_close         - 100
	 * @hooked wc_mnm_template_child_item_details_wrapper_close - 110
	 */
	do_action( 'wc_mnm_variation_loop_item', $variation );

	?>
</li>
