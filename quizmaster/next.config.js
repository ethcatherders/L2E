module.exports = {
  reactStrictMode: true,
  env: {
    MoralisServerURL: process.env.MORALIS_SERVER_URL,
    MoralisAppID: process.env.MORALIS_APP_ID
  },
  images: {
    domains: ["img.youtube.com"]
  }
}
