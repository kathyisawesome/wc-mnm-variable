/*global WC_MNM_ADD_TO_CART_VARIATION_PARAMS */
;(function ( $, window, document, undefined ) {
	/**
	 * WC_MNM_Variation_Form class which handles variation forms and attributes.
	 */
  var WC_MNM_Variation_Form = function( $form ) {
		var self = this;

    self.$form              = $form;
    self.$selectors         = $form.find( '.wc-mnm-variations :radio' );
    self.$mnmVariation      = $form.find( '.single_mnm_variation' );
    
    self.variationData      = $form.data( 'product_variations' );
		self.useAjax            = false === self.variationData;
		self.xhr                = false;
		self.scroll             = false;
    self.html_forms         = []; // Keyed by variation ID.
    self.validation_context = $form.data( 'validation_context' ) || 'add-to-cart';

    self.storedConfig       = [];

    // Add MNM container class.
    self.$form.addClass( 'mnm_form variations_form' );

    // Bind methods.
    self.displayForm = self.displayForm.bind( self );
    self.shutdown    = self.shutdown.bind( self );

    // Events.
    $form.on( 'found_variation.wc-mnm-variable-form', { mnmVariationForm: self }, self.onFoundVariation );
    $form.on( 'check_radio_variations.wc-mnm-variable-form', { mnmVariationForm: self }, self.checkRadioVariation );
    $form.on( 'update_variation_values', self.shutdown );

    // Catch initial reset and re-run findVariations with data from radio inputs.
    $form.on( 'reset_data', { mnmVariationForm: self }, self.onReset );
    $form.on( 'reload_product_variations', { mnmVariationForm: self }, self.onReload );

    // Listen for radio change.
    $form.on( 'change.wc-mnm-variable-form', '.wc-mnm-variations :radio', { mnmVariationForm: self }, self.onChange );

    // Finally display the form when requested.
    $form.on( 'wc_mnm_variation_form_load', { mnmVariationForm: self }, self.displayForm );

    // Stash the configuration for later.
    $form.on( 'wc-mnm-container-quantities-updated', function(event, container) {
      self.storedConfig = container.api.get_container_config();
    } );
    // Persist config when switching between variations.
    $form.on( 'wc-mnm-initializing', function(event, container) {

     if ( container.child_items.length && Object.keys( self.storedConfig ).length ) {

        let total_qty = 0;

        // Add up quantities.
        for ( let child_item of container.child_items ) {

          let new_qty = self.storedConfig[ child_item.get_item_id() ] || 0;

          child_item.update_quantity( new_qty );

          total_qty += child_item.get_quantity();

          if ( total_qty >= container.api.get_max_container_size() ) {
            break;
          }

        }

      }

    } );

    // Add data to ajax submit when editing a container.
    $( document ).on( 'wc_mnm_update_container_order_item_data', { mnmVariationForm: self }, self.addVariationData );
  };

  /**
   * Shutdown the mix and match listeners
   */
  WC_MNM_Variation_Form.prototype.shutdown = function() {
    // Shutdown all MNM listeners. Future self: this cannot be removed or chaging the attribute fires the change event on all child items for an unknown reason.
    this.$form.find( '*' ).off( '.wc-mnm-form' );
  };

  /**
	 * Triggered when an attribute field changes.
	 */
  WC_MNM_Variation_Form.prototype.onChange = function( event ) {

    var form = event.data.mnmVariationForm;

    // Set the scroll flag.
    form.scroll = true;

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

  /**
   * When variation is found, load the MNM form.
   */
  WC_MNM_Variation_Form.prototype.onFoundVariation = function( event, variation ) {

    let form = event.data.mnmVariationForm;

    if ( variation.variation_is_visible  ) {

     if (  'undefined' === variation.mix_and_match_html ) {

        variation.mix_and_match_html = 'undefined' !== typeof form.html_forms[ variation.variation_id ] ? form.html_forms[ variation.variation_id ] : false;

      }

      if ( variation.mix_and_match_html ) {

        form.$form.trigger( 'wc_mnm_variation_form_load', [ variation ] );  

      } else {

        form.$form.trigger( 'wc_mnm_variation_form_loading', [ variation ] );

        let $target = form.$form.find( '.single_variation_wrap' );
        form.block( $target );

        $.ajax( {
          url: WC_MNM_ADD_TO_CART_VARIATION_PARAMS.wc_ajax_url.toString().replace( '%%endpoint%%', 'mnm_get_variation_container_form' ),
          type: 'POST',
          data: {
            variation_id      : variation.variation_id,
            dataType          : 'json',
            validation_context: form.validation_context,
            request           : window.location.href,
            source            : form.$form.data( 'source' ) || '',
            extra_data        : form.$form.data( 'extra_data' ) || ''
          },
          success: function( response ) {
    
            if ( response.success && response.data ) {
    
              // Load the Form in the modal. We get fragments returned, but in admin we only need the form.
              if ( 'undefined' !== typeof response.data[ 'div.wc-mnm-container-form' ] ) {
    
                // Add response to variation object.
                variation.mix_and_match_html = response.data[ 'div.wc-mnm-container-form' ];

                form.$form.trigger( 'wc_mnm_variation_form_load', [ variation ] );

                // Store the HTML for later.
                form.html_forms[ variation.variation_id ] = variation.mix_and_match_html;
    
              }
        
            } else {
              window.alert( response.data );
            }

            form.unblock( $target );
    
          },
          fail: function() {
            window.alert( WC_MNM_ADD_TO_CART_VARIATION_PARAMS.i18n_form_error );
          }
        } );

      }      

    }

  };

  /**
   * Render the MNM form.
   */
  WC_MNM_Variation_Form.prototype.displayForm = function( event, variation ) {

    if ( variation.mix_and_match_html ) {

      let $target = $( event.target ).find( '.single_mnm_variation' );
      let template = wp.template( 'wc-mnm-variation-template' );
      
      let $template_html = template( {
        variation: variation
      } );
      $template_html = $template_html.replace( '/*<![CDATA[*/', '' );
      $template_html = $template_html.replace( '/*]]>*/', '' );

      // HTML must be loaded first for MNM scripts to catch the container ID.
      $target.toggleClass( 'wc_mnm_variation_out_of_stock', ! variation.is_in_stock ).html( $template_html );

      // Fire MNM scripts.
      $( event.target ).trigger( 'wc-mnm-initialize.mix-and-match' );

      // Dynamically store variation ID in place that is automatically include in submit data when editing container.
      $( event.target ).data( 'variation_id', variation.variation_id );

      // Finally, show the elements.
      $target.removeClass( 'processing' ).show();

      if ( ! $target.wcMNMisInViewport() && this.scroll && false !== $( document.body ).triggerHandler( 'wc_mnm_scroll_to_variation' ) ) {
        $('html,body').animate({
          scrollTop: $target.offset().top
        });
      }

      $( event.target ).trigger( 'wc_mnm_variation_form_loaded', [ variation ] );

    } else {
      $( event.target ).find( '.single_mnm_variation' ).html('');
    }

  };  

  // Uncheeck all radio buttons when reset.
  WC_MNM_Variation_Form.prototype.onReset = function( event ) {

    let form = event.data.mnmVariationForm;

    // Woo core's first pass at checking variations will not find the match because it is looking specifically for its <select> elements.
    if ( ! form.initialized ) {
      form.initialized = true;
      form.$form.trigger( 'check_radio_variations' );
      return false;
    }

    // Reset stored config.
    form.storedConfig = [];

    $( event.target ).find( '.single_mnm_variation' ).hide();
    form.$selectors.prop( 'checked', false );

    form.$form.find( '.reset_variations' ).css( 'visibility', 'hidden' );

    $( event.target ).trigger( 'wc_mnm_variation_reset' );
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

  /**
	 * Add variation_id to $_POST
	 *
	 */
  WC_MNM_Variation_Form.prototype.addVariationData = function( event ) {
    var form = event.data.mnmVariationForm;
    return { variation_id: form.$form.data( 'variation_id' ) || 0 };
  };

  /**
	 * Check if a node is blocked for processing.
	 *
	 * @param {JQuery Object} $node
	 * @return {bool} True if the DOM Element is UI Blocked, false if not.
	 */
  WC_MNM_Variation_Form.prototype.is_blocked = function( $node ) {
		return $node.is( '.processing' ) || $node.parents( '.processing' ).length;
	};

	/**
	 * Block a node visually for processing.
	 *
	 * @param {JQuery Object} $node
	 */
  WC_MNM_Variation_Form.prototype.block = function( $node ) {
		if ( !  WC_MNM_Variation_Form.prototype.is_blocked( $node ) ) {
			$node.addClass( 'processing' ).block( {
        message: null,
        theme: true      
			} );
		}
	};

	/**
	 * Unblock a node after processing is complete.
	 *
	 * @param {JQuery Object} $node
	 */
  WC_MNM_Variation_Form.prototype.unblock = function( $node ) {
		$node.removeClass( 'processing' ).unblock();
	};


  /*-----------------------------------------------------------------*/
  /*  Helpers.                                                       */
  /*-----------------------------------------------------------------*/

  $.fn.wcMNMisInViewport = function() {

    if ( ! this.length ) {
      return true;
    }
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
    if ( typeof WC_MNM_ADD_TO_CART_VARIATION_PARAMS !== 'undefined' && typeof wc_add_to_cart_variation_params !== 'undefined' && typeof wc_mnm_params !== 'undefined' ) {
      $( this ).wc_variation_form();
      new WC_MNM_Variation_Form( this );
    }
    return this;
  };

  $(function() {
    $( document ).on( 'wc-mnm-initialize.variable-mix-and-match', '.variable_mnm_form', function() {
      $( this ).wc_mnm_variation_form();
    } );
  
    $( '.variable_mnm_form' ).each(
      function() {
        $( this ).trigger( 'wc-mnm-initialize.variable-mix-and-match' );
      }
    );
  } );

} )( jQuery, window, document );
