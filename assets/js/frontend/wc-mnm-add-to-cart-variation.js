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
        self.shutdown = self.shutdown.bind( self );

        // Events.
        $form.on( 'found_variation.wc-mnm-variable-form', { mnmVariationForm: self }, self.onFoundVariation );
        $form.on( 'check_radio_variations.wc-mnm-variable-form', { mnmVariationForm: self }, self.checkRadioVariation );
        $form.on( 'update_variation_values', self.shutdown );

        // Catch initial reset and re-run findVariations with data from radio inputs.
        $form.on( 'reset_data', { mnmVariationForm: self }, self.onReset );
        $form.on( 'reload_product_variations', { mnmVariationForm: self }, self.onReload );

        // Listen for radio change.
        $form.on( 'change.wc-mnm-variable-form', '.wc-mnm-variations :radio', { mnmVariationForm: self }, self.onChange );

        // Stash the configuration for later.
        $form.on(
            'wc-mnm-container-quantities-updated',
            function(event, container) {
                self.storedConfig = container.api.get_container_config();
            }
        );
        // Persist config when switching between variations (as much as possible given  quantities).
        $form.on(
            'wc-mnm-initializing',
            function(event, container) {

                let storedConfig     = self.storedConfig; // Set here as child_item.update_quantity() is going to wipe out the container.storedConfig on first pass through for loop.
                let maxContainerSize = container.api.get_max_container_size();

                if ( ! isNaN( maxContainerSize ) && container.child_items.length && Object.keys( storedConfig ).length ) {

                    // Add up quantities.
                    for ( let child_item of container.child_items ) {

                        let slotsRemaining = maxContainerSize - container.api.get_container_size();
                        let newQty         = storedConfig[ child_item.get_item_id() ] || 0;

                        if ( slotsRemaining - newQty >= 0 ) {
                            child_item.update_quantity( newQty );
                        } else {
                            child_item.update_quantity( slotsRemaining );
                            break;
                        }

                    }

                }

            }
        );

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


        if ( variation.variation_is_visible ) {

            let $target = form.$mnmVariation;

            // form.$mnmVariation.data( 'product_id', variation.variation_id );

            event.currentTarget.querySelector('.mix-and-match-root').setAttribute( 'data-product_id', variation.variation_id );





            // Fire MNM scripts.
            //$( event.target ).trigger( 'wc-mnm-initialize.mix-and-match' );

            // Dynamically store variation ID in place that is automatically include in submit data when editing container.
            // $( event.target ).data( 'variation_id', variation.variation_id );

            if ( ! $target.wcMNMisInViewport() && this.scroll && false !== $( document.body ).triggerHandler( 'wc_mnm_scroll_to_variation' ) ) {
                $( 'html,body' ).animate(
                    {
                        scrollTop: $target.offset().top
                    }
                );
            }

            $( event.target ).trigger( 'wc_mnm_variation_form_loaded', [ variation ] );

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

        event.currentTarget.querySelector('.mix-and-match-root').setAttribute( 'data-product_id', '' );

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

        $form.find( '.wc-mnm-variations' ).each(
            function() {
                var attribute_name = $( this ).find( 'input:radio' ).first().attr( 'name' );
                var value          = $( this ).find( 'input:checked' ).val() || '';

                if ( value.length > 0 ) {
                    chosen ++;
                }

                count ++;
                data[ attribute_name ] = value;
            }
        );

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
            $node.addClass( 'processing' ).block(
                {
                    message: null,
                    theme: true
                }
            );
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
        var elementTop = $( this ).offset().top;
        var elementBottom = elementTop + $( this ).outerHeight();
        var viewportTop = $( window ).scrollTop();
        var viewportBottom = viewportTop + $( window ).height();
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

    $(
        function() {
            $( document ).on(
                'wc-mnm-initialize.variable-mix-and-match',
                '.variable_mnm_form',
                function() {
                    $( this ).wc_mnm_variation_form();
                }
            );

            $( '.variable_mnm_form' ).each(
                function() {
                    $( this ).trigger( 'wc-mnm-initialize.variable-mix-and-match' );
                }
            );
        }
    );

} )( jQuery, window, document );