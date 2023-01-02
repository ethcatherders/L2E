export const FactoryAddresses = {
    prod: {
        network: 'polygon',
        chainId: 137,
        address: "",
        provider: process.env.AlchemyUrl
    },
    dev: {
        network: 'mumbai',
        chainId: 80001,
        address: "0x8164dABCE65837D0D4E773CEe628e35603a51E0b",
        provider: process.env.AlchemyUrl_Dev
    }
}