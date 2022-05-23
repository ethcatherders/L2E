module.exports = {
  reactStrictMode: true,
  env: {
    MoralisServerURL: process.env.MORALIS_SERVER_URL,
    MoralisAppID: process.env.MORALIS_APP_ID,
    ReCaptchaSecret: process.env.RECAPTCHA_SECRET_KEY,
    ReCaptchaSiteKey: process.env.RECAPTCHA_SITE_KEY
  }
}
