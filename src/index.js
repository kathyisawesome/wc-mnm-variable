import { createRoot, render } from '@wordpress/element';
import MixAndMatch from './mix-and-match';

// Attach the event listener
const targets = document.querySelectorAll( '.wc-mix-and-match-root' );

targets.forEach( function ( target ) {

	if ( createRoot ) {
		createRoot( target ).render( <MixAndMatch target={ target } /> );
	} else {
		render( <MixAndMatch />, target );
	}
} );
