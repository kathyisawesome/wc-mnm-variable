import { createReduxStore } from '@wordpress/data';
 
import {
  CONFIG_STORE_KEY as CONFIG_STORE_KEY,
  CONFIG_STORE_CONF as config_conf
} from "./config";

console.debug('CONFIG_STORE_KEY', CONFIG_STORE_KEY);

createReduxStore( CONFIG_STORE_KEY, config_conf );
 
export { CONFIG_STORE_KEY };
