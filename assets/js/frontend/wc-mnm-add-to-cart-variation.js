/*global WC_MNM_VARIATION_ADD_TO_CART_PARAMS */
;(function ( $, window, document, undefined ) {
	/**
	 * WC_MNM_Variation_Form class which handles variation forms and attributes.
	 */
  var WC_MNM_Variation_Form = function( $form ) {
		var self = this;

    self.$form         = $form;
    self.$selectors    = $form.find( '.wc-mnm-variations :radio' );
    self.$mnmVariation = $form.find( '.single_mnm_variation' );
    
    self.variationData = $form.data( 'product_variations' );
		self.useAjax       = false === self.variationData;
		self.xhr           = false;
		self.initialized   = false;

    /**
     * Bind event handlers.
     */
    $form.on( 'found_variation', { mnmVariationForm: self }, self.onFoundVariation );
    $form.on( 'check_radio_variations', { mnmVariationForm: self }, self.checkRadioVariation );

    // Catch initial reset and re-run findVariations with data from radio inputs.
    $form.on( 'reset_data', { mnmVariationForm: self }, self.onReset );
    $form.on( 'reload_product_variations', { mnmVariationForm: self }, self.onReload );

    self.$selectors.on( 'change', { mnmVariationForm: self }, this.onChange );

  };

  /**
	 * Triggered when an attribute field changes.
	 */
  WC_MNM_Variation_Form.prototype.onChange = function( event ) {

		var form = event.data.mnmVariationForm;

		form.$form.find( 'input[name="variation_id"], input.variation_id' ).val( '' ).trigger( 'change' );
		form.$form.find( '.wc-no-matching-variations' ).remove();

		if ( form.useAjax ) {
			form.$form.trigger( 'check_radio_variations' );
		} else {
			form.$form.trigger( 'woocommerce_variation_select_change' );
			form.$form.trigger( 'check_radio_variations' );
		}

		// Custom event for when variation selection has been changed
		form.$form.trigger( 'woocommerce_variation_has_changed' );
	};

  /**
   * Custom callback to tell Woo to check variations with our radio attributes.
   */
  WC_MNM_Variation_Form.prototype.checkRadioVariation = function( event ) {
    var form = event.data.mnmVariationForm;
    var chosenAttributes = form.radioGetChosenAttributes( form.$form );
    form.$form.trigger( 'check_variations', chosenAttributes );
  };

  // When variation is found, load the MNM form.
  WC_MNM_Variation_Form.prototype.onFoundVariation = function( event, variation ) {

    var form = event.data.mnmVariationForm;

    var $target = $( event.target ).find( '.single_mnm_variation' );

    if ( variation.variation_is_visible && variation.mix_and_match_html ) {

      var template = wp.template( 'mnm-variation-template' );

      var $template_html = template( {
        variation: variation
      } );
      $template_html = $template_html.replace( '/*<![CDATA[*/', '' );
      $template_html = $template_html.replace( '/*]]>*/', '' );

      // HTML must be loaded first for MNM scripts to catch the container ID.
      $target.html( $template_html );

      // Clear out the script ID to bypass shutdown() (a wrapper for .off()) and that is killing the variable MNM variation swatch selector.
      form.$form.removeData( 'script_id' );

      // Fire MNM scripts.
      if ( wc_mnm_scripts.length && 'undefined' !== typeof ( wc_mnm_scripts[ variation.variation_id ] ) ) {
        wc_mnm_scripts[ variation.variation_id ].api.reinitialize();
      } else {
        $( event.target ).wc_mnm_form();
      }

      // Finally, show the elements.
      $target.show();

      if ( ! $target.wcMNMisInViewport() ) {
        $('html,body').animate({
          scrollTop: $target.offset().top
        });
      }

      form.$form.trigger( 'wc_mnm_variation_found', [ variation ] );

    }

  };

  // Uncheeck all radio buttons when reset.
  WC_MNM_Variation_Form.prototype.onReset = function( event ) {

    var form = event.data.mnmVariationForm;

    // Woo core's first pass at checking variations will not find the match because it is looking specifically for its <select> elements.
    if ( ! form.initialized ) {
      form.initialized = true;
      form.$form.trigger( 'check_radio_variations' );
      return false;
    }

    
    $( event.target ).find( '.single_mnm_variation' ).hide();
    form.$selectors.prop( 'checked', false );

    form.$form.find( '.reset_variations' ).css( 'visibility', 'hidden' );
  };

  
  // Uncheeck all radio buttons when reset.
  WC_MNM_Variation_Form.prototype.onReload = function( event ) {
    var form = event.data.mnmVariationForm;
    form.$form.trigger( 'check_radio_variations' );
  };

  /**
  * Get chosen attributes from form.
  * @return array
  */ 
  WC_MNM_Variation_Form.prototype.radioGetChosenAttributes = function( $form ) {
    var data   = {};
    var count  = 0;
    var chosen = 0;

    $form.find( '.wc-mnm-variations' ).each( function() {
        var attribute_name = $( this ).find( 'input:radio' ).first().attr( 'name' );
        var value          = $( this ).find( 'input:checked' ).val() || '';

        if ( value.length > 0 ) {
            chosen ++;
        }

        count ++;
        data[ attribute_name ] = value;
    });

    return {
        'count'      : count,
        'chosenCount': chosen,
        'data'       : data
    };

  };

  /*-----------------------------------------------------------------*/
  /*  Helpers.                                                       */
  /*-----------------------------------------------------------------*/

  $.fn.wcMNMisInViewport = function() {
    var elementTop = $(this).offset().top;
    var elementBottom = elementTop + $(this).outerHeight();
    var viewportTop = $(window).scrollTop();
    var viewportBottom = viewportTop + $(window).height();
    return elementBottom > viewportTop && elementTop < viewportBottom;
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
