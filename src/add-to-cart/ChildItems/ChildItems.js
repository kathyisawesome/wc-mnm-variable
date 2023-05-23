/**
 * External dependencies
 */
import { createContext, useContext } from '@wordpress/element';
import { __ } from '@wordpress/i18n';


/**
 * WooCommerce dependencies
 */
//      <ProductImage product={product} />
//import { ProductImage } from '@woocommerce/components';

/**
 * Internal dependencies
 */
import ChildItem from './ChildItem/ChildItem';
import { ConfigContext, ChildContext } from '../../context/Context';

function ChildItems( {childItems, childCategories} ) {

    
    const config = useContext(ConfigContext);

    const num_columns = WC_MNM_ADD_TO_CART_REACT_PARAMS.num_columns;
    const display_layout = WC_MNM_ADD_TO_CART_REACT_PARAMS.display_layout;
    const has_rows = childItems.length > num_columns ? 'has-multilpe-rows' : '';
    const mobile_optimized = WC_MNM_ADD_TO_CART_REACT_PARAMS.mobile_optimized_layout ? 'mnm-mobile-optimized'  : '';

    const getItems = (childProducts) => {
        return (
            display_layout === 'grid' ? (
                <ul className="wc-block-grid__products">
                    { childProducts.map((childItem, index) => (
                        <ChildContext.Provider key={childItem.child_id} value={childItem}>
                            <ChildItem />
                        </ChildContext.Provider>
                    ) ) }
                </ul>
            ) : (
                <table cellspacing="0" className="products mnm_child_products tabular mnm_table shop_table">
                    <thead>
                    <tr>
                        <th> </th>
                        <th>{__('Product','wc-mnm-variable')}</th>
                        <th>{__('Quantity','wc-mnm-variable')}</th>
                    </tr>
                    </thead>
                    <tbody>
                    {
                        childProducts.map((childItem, index) => (
                            <ChildContext.Provider key={childItem.child_id} value={childItem}>
                                <ChildItem />
                            </ChildContext.Provider>
                        ) )
                    }
                    </tbody>
                </table>
            )
        );
    }

    const getCategoryItems = (categories, childItems) => {
        let displayItems = [];
        let displayedItems = [];

        return Object.entries(categories).map(([categoryId, categoryName]) => {
            displayItems = [];

            return (
                <>
                    <h2 className="woocommerce-loop-category__title">{categoryName}</h2>
                    {childItems.map((childItem, index) => {
                        if (
                            childItem.category_ids.some(item => Number(item) === Number(categoryId)) &&
                            (0 === displayedItems.length || !displayedItems.some(item => item.child_id === childItem.child_id))
                        ) {
                            displayItems.push(childItem);
                        }
                        if (index + 1 === childItems.length) {
                            displayedItems = displayedItems.length !== 0
                                ? [...displayItems, ...displayedItems.filter(item => !displayItems.some(displayItem => displayItem.child_id === item.child_id))]
                                : displayItems;
                            return displayItems.length !== 0 ? getItems(displayItems) : '';
                        }
                    })}
                </>
            );
        });
    };

    return (
        <div className={`products mnm-variable-product mnm_child_products wc-block-${display_layout} has-${num_columns}-columns ${has_rows} ${mobile_optimized}`}>
            { childCategories.length !== 0 ? getCategoryItems(childCategories,childItems) : getItems(childItems) }
            <div className={"product-cart-overview mnm-variable-product-cart-view mnm-variable-product-cart-view-main"}>
                <div className={"product-cart-overview mnm-variable-product-cart-view-container"}>
                    <div className={"mnm-variable-cart-view-title-wrapper"}>
                        <h4>{__('Your Selection','wc-mnm-variable')}</h4>
                    </div>
                    <div className={"mnm-variable-cart-view-content-wrapper"}>
                    </div>
                    <div className={"mnm-variable-cart-view-footer-wrapper"}>
                        <div className={"variable-cart-footer-actions"}>
                            <a className={"edit-cart"}>{__('Edit item(s)','wc-mnm-variable')}</a>
                            <a className={"reset-cart"}>{__('Reset Cart','wc-mnm-variable')}</a>
                        </div>
                        <p className={'mnm-minicart-quantity note'}>{__('Please add 0 items to complete.','wc-mnm-variable')}</p>
                        <p className={'mnm-minicart-price'}><span className={'mnm-minicart-price-label'}>{__('Total: ','wc-mnm-variable')}</span><span className={'mnm-minicart-total-price'}></span>(<span className={'mnm-cart-product-items'}>0</span>{__(' items','wc-mnm-variable')})</p>
                    </div>
                </div>
            </div>
        </div>
    )
    
}
export default ChildItems