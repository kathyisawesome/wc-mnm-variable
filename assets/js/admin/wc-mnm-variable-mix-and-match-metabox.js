jQuery( function( $ ) {

	// Variable/variations support.
	$( '.enable_variation' ).addClass( 'show_if_variable-mix-and-match' );
	$( '.variations_tab' ).addClass( 'show_if_variable-mix-and-match' );
	
	// Hide the "Grouping" field.
	//$( '#linked_product_data .grouping.show_if_simple, #linked_product_data .form-field.show_if_grouped' ).addClass( 'hide_if_variable-mix-and-match' );

	$( '#variable_product_options' ).on( 'reload', function() {
		$( '.enable_variation' ).addClass( 'show_if_variable-mix-and-match' );
	} );
	
	// Variable type options are valid for mnm.
	$( '#woocommerce-product-data .show_if_variable:not(.hide_if_variable-mix-and-match)' ).addClass( 'show_if_variable-mix-and-match' );

	// Show packing options.
	$( '#shipping_product_data .mnm_packing_options' ).addClass( 'show_if_variable-mix-and-match' );

	// Show "enable variation" on new attribute creation.
	$( document.body ).on( 'woocommerce_added_attribute', function() {
		$( '.enable_variation' ).addClass( 'show_if_variable-mix-and-match' );

		if ( 'variable-mix-and-match' === $( 'select#product-type' ).val() ) {
			$( '.enable_variation' ).show();
		}
	});

	// Hide/Show variation discount and NYP fields.
	$( '#woocommerce-product-data' ).on( 'wc_mnm_per_product_pricing_changed', function( event, mode ) {

		var $variation_nyp = $( '#variable_product_options .woocommerce_variations' ).find( '.variation_is_nyp' ).parent();

		if ( 'per-item' === mode ) {
			$variation_nyp.hide();
		} else {
			$variation_nyp.show();
		}
	} );

	// Hide/Show variation dimension fields.
	$( '#shipping_product_data' ).on( 'wc_mnm_packing_mode_changed', function( event, mode ) {

		if ( 'undefined' === mode ) {
			mode = event.target.value;
		}

		var $variations = $( '#variable_product_options .woocommerce_variations' );

		// If packed together or separate with additional container... we need physical dimensions.
		if ( 'together' === mode || 'separate_plus' === mode ) {
			$variations.find( '.show_if_variation_virtual' ).hide();
			$variations.find( '.hide_if_variation_virtual' ).show();
		} else {
			$variations.find( '.show_if_variation_virtual' ).show();
			$variations.find( '.hide_if_variation_virtual' ).hide();
		}

	} );

	// Variable Mix and Match type specific options.

	$( document.body ).on( 'woocommerce-product-type-change', function( event, select_val ) {

		$( '.hide_if_not_variable-mix-and-match' ).hide();

		if ( select_val === 'variable-mix-and-match' ) {

			$( '.show_if_variable-mix-and-match' ).show();
			$( '.hide_if_variable-mix-and-match' ).hide();

			// Handle hide/show of toggles inside VMNM panel.
			$( '.wc_mnm_display_toggle input[type="checkbox"]' ).trigger( 'change' );
			$( '.wc_mnm_display_toggle :input[type!="checkbox"]:checked' ).trigger( 'change' );
					
			$( 'input#_manage_stock' ).trigger( 'change' );

			// Blunt-force the shipping tab to show. Necessary if not updated and user still has _virtual meta = 'yes'.
			$( '.product_data_tabs .shipping_options ' ).show();

			// Trigger enahnced category selects.
			$( document.body ).trigger( 'wc-mnm-enhanced-category-select-init' );

		}

	} );
	
	// Re-trigger initial change.
	$( '#product-type').trigger( 'change' );

	// Variations loaded + new variation.
	$( '#woocommerce-product-data' ).on( 'woocommerce_variations_loaded woocommerce_variations_added', function() {

		// Move the MNM fields after the pricing fields.
		$( '#variable_product_options .wc_mnm_variation_options.options_group' ).not( '.wc_mnm_moved' ).each(
			function() {
				$( this ).insertAfter( $( this ).siblings( '.variable_pricing' ) ).addClass( 'wc_mnm_moved' );
			}
		);

		$( '.hide_if_not_variable-mix-and-match' ).hide();

		if ( $( 'select#product-type' ).val() === 'variable-mix-and-match' ) {
			$( '.show_if_variable-mix-and-match' ).show();
			$( '.hide_if_variable-mix-and-match' ).hide();
			
			// Always hide variation virtual checkbox.
			$( '#variable_product_options .woocommerce_variations' ).find( '.variable_is_virtual' ).parent().hide();

			// Handle hide/show of toggles inside variation panel.
			$( '.wc_mnm_display_toggle input[type="checkbox"]' ).trigger( 'change' );
			$( '.wc_mnm_display_toggle :input[type!="checkbox"]:checked' ).trigger( 'change' );
		}

		// Trigger enahnced category selects.
		$( document.body ).trigger( 'wc-mnm-enhanced-category-select-init' );

	} );

} );
