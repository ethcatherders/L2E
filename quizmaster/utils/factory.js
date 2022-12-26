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
        address: "",
        provider: process.env.AlchemyUrl_Dev
    }
}