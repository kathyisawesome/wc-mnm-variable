/**
 * External dependencies
 */
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
import { ChildContext } from '../../context/Context';
import Loading from "../Loading";



function ChildItems( {childItems, childCategories, isReset} ) {

    const num_columns = WC_MNM_ADD_TO_CART_REACT_PARAMS.num_columns;
    const display_layout = WC_MNM_ADD_TO_CART_REACT_PARAMS.display_layout;
    const has_rows = childItems.length > num_columns ? 'has-multilpe-rows' : '';
    const mobile_optimized = WC_MNM_ADD_TO_CART_REACT_PARAMS.mobile_optimized_layout ? 'mnm-mobile-optimized'  : '';

    const getItems = (childProducts) => {
        return (
            display_layout === 'grid' ? (
                <ul className="wc-block-grid__products">
                    { childProducts.map((childItem, index) => (
                        <ChildContext.Provider key={childItem.child_id} value={{childItem,isReset}}>
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
                            <ChildContext.Provider key={childItem.child_id} value={{childItem,isReset}}>
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
        </div>
    )
    
}
export default ChildItems