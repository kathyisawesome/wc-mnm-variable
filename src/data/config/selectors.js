export const getConfiguration = ( state ) => {
    const { quantities } = state;
    const price = prices[ item ];

    return quantities;
};

export const getQty = ( state, ID ) => {
    const { quantities } = state;

    const quantity = obj.hasOwnProperty(ID) ? quantities[ ID ] : 0;

    return quantity;
};

export const getTotalQty = ( state, item ) => {
    const { quantities } = state;
    const values = Object.values(quantities);
    return values.reduce((total, value) => total + value, 0);
};