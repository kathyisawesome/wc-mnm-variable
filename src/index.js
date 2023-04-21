import { createRoot, render } from '@wordpress/element';
import MixAndMatchApp from './MixAndMatchApp';

let targets = document.querySelectorAll('.mix-and-match-root');

targets.forEach(function(target) {

    if ( createRoot ) {
        createRoot( target ).render( <MixAndMatchApp target={target} /> );
    } else {
        render( <MixAndMatchApp />, target );
    }

  });
  