<?php
/**
 * Mix and Match Variation Add to Cart
 *
 * This template can be overridden by copying it to yourtheme/woocommerce/single-product/add-to-cart/mnm-variation-add-to-cart.php
 *
 * HOWEVER, on occasion WooCommerce Mix and Match will need to update template files and you
 * (the theme developer) will need to copy the new files to your theme to
 * maintain compatibility. We try to do this as little as possible, but it does
 * happen. When this occurs the version of the template file will be bumped and
 * the readme will list any important changes.
 *
 * @see     https://woocommerce.com/document/template-structure/
 * @package Variable Mix and Match\Templates
 * @version 1.0.0
 */

// Exit if accessed directly.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

?>

<div class="wc_mnm_variation">

	<?php

	/**
	 * 'wc_mnm_content_loop' action.
	 *
	 * @param  WC_Mix_and_Match_Variation  $variation
	 * 
	 * @hooked wc_mnm_variation_header    - 10
	 * @hooked wc_mnm_content_loop        - 20
	 * @hooked wc_mnm_template_reset_link - 30
	 * @hooked wc_mnm_template_status     - 40
	 */
	do_action( 'wc_mnm_variation_content_loop', $variation );

	?>

</div>
