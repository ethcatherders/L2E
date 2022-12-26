import { createContext, useState } from "react";

export const AdminContext = createContext()

export function AdminContextProvider({ children }) {
	const [isAdmin, setIsAdmin] = useState(false)
	const [ethAddress, setEthAddress] = useState('')
	const [devMode, setDevMode] = useState(false);

	return (
		<AdminContext.Provider
			value={{
				isAdmin,
				setIsAdmin,
				ethAddress,
				setEthAddress,
				devMode,
				setDevMode
			}}
		>
			{children}
		</AdminContext.Provider>
	)
}