/*global WC_MNM_ADD_TO_CART_VARIATION_PARAMS */
( function ( $, window, document, undefined ) {
	/**
	 * WC_MNM_Variation_Form class which handles variation forms and attributes.
	 *
	 * @param $form
	 */
	const WC_MNM_Variation_Form = function ( $form ) {
		const self = this;

		self.$form = $form;
		self.$selectors = $form.find( '.wc-mnm-variations :radio' );
		self.$mnmVariation = $form.find( '.wc-mnm-variation' );
		self.$addToCart = $form.find( '.single_add_to_cart_button' );

		self.variationData = $form.data( 'product_variations' );
		self.useAjax = self.variationData === false;
		self.xhr = false;
		self.scroll = false;
		self.html_forms = []; // Keyed by variation ID.
		self.validation_context =
			$form.data( 'validation_context' ) || 'add-to-cart';

		// Add MNM container class.
		self.$form.addClass( 'mnm_form variations_form' );

		// Bind methods.
		self.shutdown = self.shutdown.bind( self );

		// Events.

		// Listen for Data Store updates.
		// Disabled add to cart button and stash the config on the form attributes for use when saving in admin.
		document.addEventListener( 'wc/mnm/container/container-updated', ( e ) => {
			self.$addToCart.toggleClass( 'disabled', ! e.detail.isValid );
			self.$form.data( 'config', e.detail.config );
		} );

		$form.on(
			'found_variation.wc-mnm-variable-form',
			{ mnmVariationForm: self },
			self.onFoundVariation
		);
		$form.on(
			'check_radio_variations.wc-mnm-variable-form',
			{ mnmVariationForm: self },
			self.checkRadioVariation
		);
		$form.on( 'update_variation_values', self.shutdown );

		// Catch initial reset and re-run findVariations with data from radio inputs.
		$form.on( 'reset_data', { mnmVariationForm: self }, self.onReset );
		$form.on(
			'reload_product_variations',
			{ mnmVariationForm: self },
			self.onReload
		);

		// Listen for radio change.
		$form.on(
			'change.wc-mnm-variable-form',
			'.wc-mnm-variations :radio',
			{ mnmVariationForm: self },
			self.onChange
		);

		// Add data to ajax submit when editing a container.
		$( document ).on(
			'wc_mnm_update_container_order_item_data',
			{ mnmVariationForm: self },
			self.addVariationData
		);
	};

	/**
	 * Shutdown the mix and match listeners
	 */
	WC_MNM_Variation_Form.prototype.shutdown = function () {
		// Shutdown all MNM listeners. Future self: this cannot be removed or chaging the attribute fires the change event on all child items for an unknown reason.
		this.$form.find( '*' ).off( '.wc-mnm-form' );
	};

	/**
	 * Triggered when an attribute field changes.
	 *
	 * @param event
	 */
	WC_MNM_Variation_Form.prototype.onChange = function ( event ) {
		const form = event.data.mnmVariationForm;

		// Set the scroll flag.
		form.scroll = true;

		form.$form
			.find( 'input[name="variation_id"], input.variation_id' )
			.val( '' )
			.trigger( 'change' );
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
	 *
	 * @param event
	 */
	WC_MNM_Variation_Form.prototype.checkRadioVariation = function ( event ) {
		const form = event.data.mnmVariationForm;
		const chosenAttributes = form.radioGetChosenAttributes( form.$form );
		form.$form.trigger( 'check_variations', chosenAttributes );
	};

	/**
	 * When variation is found, load the MNM form.
	 *
	 * @param event
	 * @param variation
	 */
	WC_MNM_Variation_Form.prototype.onFoundVariation = function (
		event,
		variation
	) {
		const form = event.data.mnmVariationForm;

		if ( variation.variation_is_visible ) {
			const $target = form.$mnmVariation;

			event.currentTarget
				.querySelector( '.wc-mix-and-match-root' )
				.setAttribute( 'data-variation_id', variation.variation_id );

			// Dynamically store variation ID in place that is automatically include in submit data when editing container.
			$( event.target ).data( 'variation_id', variation.variation_id );

			if (
				! $target.wcMNMisInViewport() &&
				this.scroll &&
				$( document.body ).triggerHandler(
					'wc_mnm_scroll_to_variation'
				) !== false
			) {
				$( 'html,body' ).animate( {
					scrollTop: $target.offset().top,
				} );
			}

			$( event.target ).trigger( 'wc_mnm_variation_form_loaded', [
				variation,
			] );
		}
	};

	// Uncheeck all radio buttons when reset.
	WC_MNM_Variation_Form.prototype.onReset = function ( event ) {
		const form = event.data.mnmVariationForm;

		// Woo core's first pass at checking variations will not find the match because it is looking specifically for its <select> elements.
		if ( ! form.initialized ) {
			form.initialized = true;
			form.$form.trigger( 'check_radio_variations' );
			return false;
		}

		event.currentTarget
			.querySelector( '.wc-mix-and-match-root' )
			.setAttribute( 'data-variation_id', '' );

		form.$selectors.prop( 'checked', false );

		form.$form.find( '.reset_variations' ).css( 'visibility', 'hidden' );

		$( event.target ).trigger( 'wc_mnm_variation_reset' );
	};

	// Uncheeck all radio buttons when reset.
	WC_MNM_Variation_Form.prototype.onReload = function ( event ) {
		const form = event.data.mnmVariationForm;
		form.$form.trigger( 'check_radio_variations' );
	};

	/**
	 * Get chosen attributes from form.
	 *
	 * @param $form
	 * @return array
	 */
	WC_MNM_Variation_Form.prototype.radioGetChosenAttributes = function (
		$form
	) {
		const data = {};
		let count = 0;
		let chosen = 0;

		$form.find( '.wc-mnm-variations' ).each( function () {
			const attribute_name = $( this )
				.find( 'input:radio' )
				.first()
				.attr( 'name' );
			const value = $( this ).find( 'input:checked' ).val() || '';

			if ( value.length > 0 ) {
				chosen++;
			}

			count++;
			data[ attribute_name ] = value;
		} );

		return {
			count,
			chosenCount: chosen,
			data,
		};
	};

	/**
	 * Add data to $_POST for editing in admin.
	 *
	 * @param event
	 */
	WC_MNM_Variation_Form.prototype.addVariationData = function ( event ) {
		const form = event.data.mnmVariationForm;

		return {
			variation_id: form.$form.data( 'variation_id' ) || 0,
			config: form.$form.data( 'config' ) || {}		
		};
	};


	/*-----------------------------------------------------------------*/
	/*  Helpers.                                                       */
	/*-----------------------------------------------------------------*/

	$.fn.wcMNMisInViewport = function () {
		if ( ! this.length ) {
			return true;
		}
		const elementTop = $( this ).offset().top;
		const elementBottom = elementTop + $( this ).outerHeight();
		const viewportTop = $( window ).scrollTop();
		const viewportBottom = viewportTop + $( window ).height();
		return elementBottom > viewportTop && elementTop < viewportBottom;
	};

	/*-----------------------------------------------------------------*/
	/*  Initialization.                                                */
	/*-----------------------------------------------------------------*/

	/**
	 * Function to call wc_mnm_variation_form on jquery selector.
	 */
	$.fn.wc_mnm_variation_form = function () {
		if (
			typeof WC_MNM_ADD_TO_CART_VARIATION_PARAMS !== 'undefined' &&
			typeof wc_add_to_cart_variation_params !== 'undefined'
		) {
			$( this ).wc_variation_form();
			new WC_MNM_Variation_Form( this );
		}
		return this;
	};

	$( function () {
		$( document ).on(
			'wc-mnm-initialize.variable-mix-and-match',
			'.variable_mnm_form',
			function () {
				$( this ).wc_mnm_variation_form();
			}
		);

		$( '.variable_mnm_form' ).each( function () {
			$( this ).trigger( 'wc-mnm-initialize.variable-mix-and-match' );
		} );
	} );
} )( jQuery, window, document );
