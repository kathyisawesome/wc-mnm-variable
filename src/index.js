import { createRoot, render } from '@wordpress/element';
import App from './app';

let targets = document.querySelectorAll('.mix-and-match-root');

targets.forEach(function(target) {

    if ( createRoot ) {
        createRoot( target ).render( <App target={target} /> );
    } else {
        render( <App />, target );
    }

  });
  