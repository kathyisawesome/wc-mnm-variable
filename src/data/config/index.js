import * as selectors from './selectors';
import * as actions from './actions';
import * as resolvers from './resolvers';
import reducer from './reducer';
import { controls as wpControls } from "@wordpress/data-controls";
import localControls from "../controls";

export { default as CONFIG_STORE_KEY } from "./constants";

export const CONFIG_STORE_CONF = {
   selectors,
   actions,
   resolvers,
   reducer,
   controls: { ...wpControls, ...localControls }
};
