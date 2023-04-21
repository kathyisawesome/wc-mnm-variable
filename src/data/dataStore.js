import { createReduxStore } from '@wordpress/data';

const DEFAULT_STATE = {
    blockTitle: 'Default Block Title',
};

const actions = {
    setBlockTitle: (newTitle) => {
        return {
            type: 'SET_BLOCK_TITLE',
            newTitle,
        };
    },
};

const reducer = (state = DEFAULT_STATE, action) => {
    switch (action.type) {
        case 'SET_BLOCK_TITLE':
            return {
                ...state,
                blockTitle: action.newTitle,
            };
        default:
            return state;
    }
};

const selectors = {
    getBlockTitle: (state) => {
        return state.blockTitle;
    },
};

createReduxStore('woocommerce-mix-and-match-products/block-data', {
    reducer,
    actions,
    selectors,
});
