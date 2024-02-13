import { createRoot, render, createPortal } from '@wordpress/element';
import MixAndMatch from './mix-and-match';

// Attach the event listener to the desired custom event
document.addEventListener( 'wc-mnm-initialize.variable-mix-and-match', function(e) {

	const targets = e.target.querySelectorAll( '.wc-mix-and-match-root' );

	targets.forEach( function ( target ) {

		if ( createRoot ) {
			createRoot( target ).render( <MixAndMatch target={ target } /> );
		} else {
			render( <MixAndMatch />, target );
		}
	} );

});

const initMNM = new CustomEvent( 'wc-mnm-initialize.variable-mix-and-match' );

// Dispatch event on load.
document.dispatchEvent(initMNM);