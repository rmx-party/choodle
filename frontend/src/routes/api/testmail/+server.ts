import sgMail from "@sendgrid/mail";
import { SENDGRID_API_KEY } from "$env/static/private";
import { json } from "@sveltejs/kit";
import * as fs from "fs";


import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

sgMail.setApiKey(SENDGRID_API_KEY)

export const POST = async ({request, cookies}) => {
  console.log(`mail request`, request)

  const { creatorEmail, choodleId, ...unknown } = await request.json()
  console.log({ creatorEmail, choodleId, unknown })

  const pathToAttachment = `${__dirname}/../../../../static/choodle-bob-p2.png`;
  const attachment = fs.readFileSync(pathToAttachment).toString("base64");

  const to = creatorEmail
  const from = "help@rmx.party"
  const subject = `Choodle ${choodleId} is officially yours!` // placeholder for CMS content
  const msg = {
    to,
    from,
    subject,
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

  const sgResponse = await sgMail.send(msg)
    .then((res) => {
      console.log(`Email sent to ${creatorEmail} for Choodle ${choodleId}`)
      return res;
    })
    .catch((error) => {
      console.error(error)
      return [{
        body: error,
        statusCode: 500,
      }, ''];
    })
  console.log(`sgResponse`, sgResponse)
  const { statusCode, body } = sgResponse[0]

  return json({ statusCode, body })
}
