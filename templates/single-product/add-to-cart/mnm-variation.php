<?php
/**
 * Single variation display
 *
 * This is a javascript-based template for single variations (see https://codex.wordpress.org/Javascript_Reference/wp.template).
 * The values will be dynamically replaced after selecting attributes.
 *
 * @see https://docs.woocommerce.com/document/template-structure/
 * @package Variable Mix and Match\Templates
 * @version 1.0.0
 */

defined( 'ABSPATH' ) || exit;

?>
<script type="text/template" id="tmpl-wc-mnm-variation-template">
	<div class="woocommerce-mix_and_match_variation_html">{{{ data.variation.mix_and_match_html }}}</div>
</script>
