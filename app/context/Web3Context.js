import { createContext, useState } from "react";

export const Web3Context = createContext()

export function Web3ContextProvider({children}) {
	const [devMode, setDevMode] = useState(false)

	return (
		<Web3Context.Provider
			value={{
				devMode,
				setDevMode
			}}
		>
			{children}
		</Web3Context.Provider>
	)
}