export default async function handler(req, res) {
  const { body, method } = req;
  // Extract the captcha code from the request body
  const { captcha } = body;
  if (method === "POST") {
    // reCaptcha code is missing return an error
    if (!captcha) {
      return res.status(422).json({
        message: "Unproccesable request, please tick the reCaptcha box.",
      });
    }
    try {
      // send a request to the Google reCaptcha verify API to verify the captcha code you received
      const response = await fetch(
        `https://www.google.com/recaptcha/api/siteverify?secret=${process.env.ReCaptchaSecret}&response=${captcha}`,
        {
          headers: {
            "Content-Type": "application/x-www-form-urlencoded; charset=utf-8",
          },
          method: "POST",
        }
      );
      const captchaValidation = await response.json();

      if (captchaValidation.success) {
        // Return 200 OK if successful
        return res.status(200).send("OK");
      }

      return res.status(400).json({
        message: "Unproccesable request, Invalid captcha code",
      });
    } catch (error) {
      return res.status(422).json({ message: "Something went wrong" });
    }
  }
  // Return 404 if someone queries the API with a method other than POST
  return res.status(404).send("Not found");
}