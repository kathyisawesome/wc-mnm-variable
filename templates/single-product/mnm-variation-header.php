<?php
/**
 * The template for displaying mix and match allowed pproduct content within loops for variations.
 *
 * This template can be overridden by copying it to yourtheme/woocommerce/single-product/mnm-variation-header.php.
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

?>
<h2><?php printf( esc_html__( 'Choose %d selections', 'wc-mnm-variable' ), $variation->get_max_container_size() );?></h2>