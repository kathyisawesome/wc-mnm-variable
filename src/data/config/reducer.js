import DEFAULT_STATE from './defaultState';

const reducer = ( state = DEFAULT_STATE, action ) => {
  switch (action.type) {
    case 'UPDATE':

      console.debug(action);

      const updatedQuantities = {
          ...state.quantities,
          [action.item]: action.quantity,
      };

      // Calculate the total quantity
      const totalQuantity = Object.values(updatedQuantities).reduce((total, qty) => total + qty, 0);

      // Update the status based on the total quantity
      const updatedStatus = totalQuantity > 6;



      return {
      ...state,
          quantities: updatedQuantities,
          status: updatedStatus,
      };
    default:
      return state;
  }
};

export default reducer;