/**
 * External dependencies
 */
import { useContext } from "react";

/**
 * Internal dependencies
 */
import { ContainerContext, ChildContext } from '../../../../context/context';
import ProductTitle from './product-title';
import ProductDescription from './product-description';
import ProductStockStatus from './product-stock-status';
import ProductPrice from './product-price';

const ProductDetails = () => {

    const container = useContext(ContainerContext);
    const {childItem} = useContext(ChildContext);


    const { name, catalog_visibility, permalink, short_description, price_html } = childItem;

    const isProductHiddenFromCatalog =
			catalog_visibility === 'hidden' || catalog_visibility === 'search';

    const isSelectable = childItem.purchasable && childItem.in_stock;

    return (      

        <div className="wc-mnm-block-child-item__product-details">

            { isProductHiddenFromCatalog ? (
				<ProductTitle
					title={ name }
				/>
			) : (
                <a href={ permalink } tabIndex={ -1 }>
                    <ProductTitle
                        title={ name }
                    />
                </a>
			) }

            { WC_MNM_ADD_TO_CART_REACT_PARAMS.display_short_description && (
                <ProductDescription shortDescription={short_description} />
            ) }

            { isSelectable && (
                <ProductStockStatus status={childItem.availability.class} availability={childItem.availability.availability} />
            ) }

            { container.mnm_priced_per_product && (
                <ProductPrice priceString={childItem.price_html} />
            ) }

        </div>
        
    )
    
}
export default ProductDetails;