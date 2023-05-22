/**
 * External dependencies
 */
import { getSetting } from '@woocommerce/settings';
import { useMutationObserver } from '@react-hooks-library/core'
import apiFetch from '@wordpress/api-fetch';
import { useEffect, useState } from '@wordpress/element';
import { addQueryArgs } from '@wordpress/url';

/**
 * Internal dependencies
 */
import MixAndMatch from './add-to-cart/MixAndMatch';
import Loading from './add-to-cart/Loading';

export default function MixAndMatchApp( {target} ) {

  const preloadedVariableData = getSetting(
    'wcMNMVariableSettings',
    []
  );

  const productUrl = '/wc/store/v1/products';

  const [isLoading, setIsLoading]   = useState(true);
  const [productId, setProductId]   = useState(0);
  const [product, setProduct]       = useState(null);
  const [data, setData] = useState({});
  
  const fetchProduct = async() => {

    const variation = preloadedVariableData.find(obj => obj.id === productId);

    if ( variation ) {

      setProduct( variation );

    } else {

      try {

        let product = await apiFetch({
          path: `${productUrl}/${productId}` 
        });
      
        setProduct( product );
  
        setData({
          ...data,
          [product.id]: product
        });
        
      } catch (error) {
  
        // ummm what do we do with this error?
        console.debug('cannot fetch the product', error);
  
      }

    }

    setIsLoading(false);


  };

  // Fetch the inital product on page load.
  useEffect(() => {
      if(productId) {
        fetchProduct(setProduct);
      }
  }, [ productId ] );

  // Fetch the inital product ID on page load.
  useEffect(() => {
    const origProductId = parseInt( target.getAttribute('data-product_id') ) || 0;
    setProductId(origProductId);
  }, [] );

  useMutationObserver(
      target,
      (mutations) => {
        for (const mutation of mutations) {
          if (mutation.type === 'attributes') {
              const newProductId = parseInt( mutation.target.getAttribute('data-product_id') );
              setProductId(newProductId);
          }
        }
      },
      { attributes: true }
  )

  // Quietly return nothing if there's no product ID. Prevents a failed fetch for variable MNM until a variation is selected.
  if (!productId) {
    return null;
  }

  // Loading state.
  if (isLoading) {
    return ( <Loading /> )
  }

  return (
      <MixAndMatch product={product} />
  )
    
}
