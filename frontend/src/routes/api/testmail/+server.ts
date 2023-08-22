import sgMail from "@sendgrid/mail";
import { SENDGRID_API_KEY } from "$env/static/private";
import { json } from "@sveltejs/kit";

sgMail.setApiKey(SENDGRID_API_KEY)

export const POST = async (req) => {
  console.log(`mail request`, req)

  const msg = {
    to: "dees@rmx.party",
    from: "help@rmx.party",
    subject: "Sending with SendGrid is Fun",
    text: "and easy to do anywhere, even with Node.js",
    html: "<strong>and easy to do anywhere, even with Node.js</strong>",
  };

  console.log("Form submitted");
  const rawOutput = await sgMail.send(msg)
    .then((res) => {
      console.log('Email sent')
      return {
        body: JSON.stringify(res),
      };
    })
    .catch((error) => {
      console.error(error)
      return {
        body: JSON.stringify(error),
      };
    })
  const output = JSON.parse(rawOutput.body)

  return json(output);
}
