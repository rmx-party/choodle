import sgMail from "@sendgrid/mail";
import { SENDGRID_API_KEY } from "$env/static/private";
import { json } from "@sveltejs/kit";
import * as fs from "fs";


import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

sgMail.setApiKey(SENDGRID_API_KEY)

export const POST = async (req) => {
  console.log(`mail request`, req)

  const pathToAttachment = `${__dirname}/../../../../static/choodle-bob-p2.png`;
  const attachment = fs.readFileSync(pathToAttachment).toString("base64");

  const msg = {
    to: "dees@rmx.party",
    from: "help@rmx.party",
    subject: "Sending with SendGrid is Fun",
    text: "and easy to do anywhere, even with Node.js",
    html: "<strong>and easy to do anywhere, even with Node.js</strong>",
    attachments: [
      {
        content: attachment,
        filename: "bob.png",
        type: "application/png",
        disposition: "attachment"
      }
    ]
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
