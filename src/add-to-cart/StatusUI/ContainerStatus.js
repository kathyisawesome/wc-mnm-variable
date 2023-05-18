import {RawHTML} from '@wordpress/element';
function ContainerStatus() {
    return (
        <div className="mnm_status">
            <div aria-live="polite" role="status" className={"mnm_message woocommerce-message"} style={{display: 'block'}}>
                <ul className={"msg mnm_message_content"}>
                    <li><RawHTML>{WC_MNM_ADD_TO_CART_REACT_PARAMS.cart_status_message}</RawHTML></li>
                </ul>
            </div>
        </div>
    )
}
export default ContainerStatus