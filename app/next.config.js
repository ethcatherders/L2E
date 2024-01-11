module.exports = {
  reactStrictMode: true,
  env: {
    MoralisServerURL: process.env.NEXT_PUBLIC_MORALIS_SERVER_URL,
    MoralisAppID: process.env.NEXT_PUBLIC_MORALIS_APP_ID,
    ReCaptchaSecret: process.env.NEXT_PUBLIC_RECAPTCHA_SECRET_KEY,
    ReCaptchaSiteKey: process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY,
    GoogleTagId: process.env.NEXT_PUBLIC_GOOGLE_TAG_ID,
    AlchemyKey: process.env.NEXT_PUBLIC_ALCHEMY_PROD_KEY,
    AlchemyUrl: process.env.NEXT_PUBLIC_ALCHEMY_PROD_URL,
    AlchemyKey_Dev: process.env.NEXT_PUBLIC_ALCHEMY_DEV_KEY,
    AlchemyUrl_Dev: process.env.NEXT_PUBLIC_ALCHEMY_DEV_URL
  },
  images: {
    domains: ["img.youtube.com"]
  }
}
