/*global WC_MNM_VARIATION_ADD_TO_CART_PARAMS */
;(function ( $, window, document, undefined ) {
	/**
	 * WC_MNM_Variation_Form class which handles variation forms and attributes.
	 */
  var WC_MNM_Variation_Form = function( $form ) {
		var self = this;

    self.$form         = $form;
    self.$selector    = $form.find( '.wc-mnm-variation-selector :input' );
    self.$mnmVariation = $form.find( '.single_mnm_variation' );
    
    self.variationData = $form.data( 'product_variations' );
		self.useAjax       = false === self.variationData;
		self.xhr           = false;
		self.loading       = true;

    /**
     * Bind event handlers.
     */
    $form.on( 'found_variation', self.onFoundVariation );
    $form.on( 'reset_image', self.resetVariations );
    $form.on( 'reset_data', self.resetVariations );

    self.$selector.on( 'change', { mnmVariationForm: self }, this.findVariation );

    self.$selector.filter( ':checked' ).trigger( 'change' );

  }


  // When variation is found, load the MNM form.
  WC_MNM_Variation_Form.prototype.onFoundVariation = function( event, variation ) {

    $target = $( event.target ).find( '.single_mnm_variation' );

    // @todo - how to preload a variation if radio is checked? Currently seems to slideUp()
    if ( variation.variation_is_visible && variation.mix_and_match_html ) {

      template     = wp.template( 'mnm-variation-template' );
      variation_id = variation.variation_id;

      $template_html = template( {
        variation: variation
      } );
      $template_html = $template_html.replace( '/*<![CDATA[*/', '' );
      $template_html = $template_html.replace( '/*]]>*/', '' );
  
      $target.html( $template_html ).show();

      // Fire MNM scripts.
      $( event.target ).wc_mnm_form();

    }

  };

  // Hide errors when attributes are reset.
  WC_MNM_Variation_Form.prototype.resetVariations = function( event ) {
    $target = $( event.target ).find( '.single_mnm_variation' ).hide();
  }; 


  // When variation is selected, mimic Woo's VariationForm.prototype.onFindVariation.
  WC_MNM_Variation_Form.prototype.findVariation = function( event ) {

    var form    = event.data.mnmVariationForm,
    variationID = parseInt( $(this).val(), 10 ),
    data = { variation_id: variationID };

    console.debug('happening', variationID);

    if ( variationID ) {
      if ( form.useAjax ) {
        if ( form.xhr ) {
          form.xhr.abort();
        }
        form.$form.block( { message: null, overlayCSS: { background: '#fff', opacity: 0.6 } } );
        data.product_id  = parseInt( form.$form.data( 'product_id' ), 10 );
        data.custom_data = form.$form.data( 'custom_data' );

        form.xhr                      = $.ajax( {
          url: wc_add_to_cart_variation_params.wc_ajax_url.toString().replace( '%%endpoint%%', 'get_mix_and_match_variation' ),
          type: 'POST',
          data: data,
          success: function( variation ) {
            if ( variation ) {
              form.$form.trigger( 'found_variation', [ variation ] );
            } else {
              form.$form.trigger( 'reset_data' );
              attributes.chosenCount = 0;

              if ( ! form.loading ) {
                form.$form
                  .find( '.single_variation' )
                  .after(
                    '<p class="wc-no-matching-variations woocommerce-info">' +
                    wc_add_to_cart_variation_params.i18n_no_matching_variations_text +
                    '</p>'
                  );
                form.$form.find( '.wc-no-matching-variations' ).slideDown( 200 );
              }
            }
          },
          complete: function() {
            form.$form.unblock();
          }
        } );
      } else {
        form.$form.trigger( 'update_variation_values' );

        var variation = form.findMatchingVariationByID( form.variationData, variationID );

        if ( variation ) {
          form.$form.trigger( 'found_variation', [ variation ] );
        } else {
          form.$form.trigger( 'reset_data' );
          attributes.chosenCount = 0;

          if ( ! form.loading ) {
            form.$form
              .find( '.single_variation' )
              .after(
                '<p class="wc-no-matching-variations woocommerce-info">' +
                wc_add_to_cart_variation_params.i18n_no_matching_variations_text +
                '</p>'
              );
            form.$form.find( '.wc-no-matching-variations' ).slideDown( 200 );
          }
        }
      }
    } else {
      form.$form.trigger( 'update_variation_values' );
      form.$form.trigger( 'reset_data' );
    }

  };

  /**
	 * Find matching variation by ID.
	 */
   WC_MNM_Variation_Form.prototype.findMatchingVariationByID = function( variations, variationID ) {
		var match = [];
		for ( var i = 0; i < variations.length; i++ ) {
			var variation = variations[i];

			if ( variationID === variation.variation_id ) {
				match = variation;
        break;
			}
		}
		return match;
	};


  /**
   * Load the selected MNM product.
   */

  WC_MNM_Variation_Form.prototype.loadAjax = function(e) {

    e.preventDefault();

    var current_selection = self.$selector.data( 'current_selection' );
    var product_id = $(this).data( 'product_id' );
    var security   = self.$form.data( 'security' );
    var target_url = $(this).attr( 'href' );

    // If currently processing... or clicking on same item, quit now.
    if ( self.$form.is( '.processing' ) || product_id === current_selection ) {
      return false;
    } else if ( ! self.$form.is( '.processing' ) ) {
      self.$form.addClass( 'processing' ).block( {
        message: null,
        overlayCSS: {
          background: '#fff',
          opacity: 0.6
        }
      } );
    }

    self.$form.addClass( 'has-selection' ).find( '.product' ).removeClass( 'selected' );

    $(this).closest( '.product' ).addClass( 'selected' );

    self.$selector.data('current_selection', product_id);

    $.ajax( {
        url: WC_MNM_VARIATION_ADD_TO_CART_PARAMS.wc_ajax_url.toString().replace( '%%endpoint%%', 'get_mix_and_match_variation' ),
        type: 'POST',
        data: { 
          product_id: product_id,
          security: security
        },
        success: function( data ) {
          if ( data && 'success' === data.result && data.fragments ) {
              
              $.each( data.fragments, function( key, value ) {
                  $( key ).replaceWith( value );
              });

              // Initilize MNM scripts.
              if ( data.fragments[ 'div.wc-grouped-mnm-result' ] ) {
                  // Re-attach the replaced result div.
                  self.$result = self.$form.find( '.wc-grouped-mnm-result' );
                  self.$result.find( '.mnm_form' ).each( function() {
                      $(this).wc_mnm_form();
                  } );
              }

              $( document.body ).trigger( 'wc_mnm_grouped_fragments_refreshed', [ data.fragments ] );

          } else {
              location.href = target_url;
          }
          
        },
        complete: function() {
          self.$form.removeClass( 'processing' ).unblock();
        },
        fail: function() {
          location.href = target_url;
        }
    } );     

  };

  /*-----------------------------------------------------------------*/
  /*  Initialization.                                                */
  /*-----------------------------------------------------------------*/

  /**
	 * Function to call wc_mnm_variation_form on jquery selector.
	 */
	$.fn.wc_mnm_variation_form = function() {
		new WC_MNM_Variation_Form( this );
		return this;
	};

  $(function() {
		if ( typeof WC_MNM_VARIATION_ADD_TO_CART_PARAMS !== 'undefined' ) {
			$( '.variable_mnm_form' ).each( function() {
				$( this ).wc_mnm_variation_form();
			});
		}
	});

} )( jQuery, window, document );
