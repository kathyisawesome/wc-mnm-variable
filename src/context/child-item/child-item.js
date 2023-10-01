import { createContext, useContext } from '@wordpress/element';

const ChildContext = createContext();

export function useChild() {
	return useContext( ChildContext );
}

export function ChildProvider( { childItem, children } ) {
	return (
		<ChildContext.Provider value={ childItem }>
			{ children }
		</ChildContext.Provider>
	);
}
