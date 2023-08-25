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

  const choodleUrl = `https://choodle.xyz/c/${choodleId}`

  const to = creatorEmail
  const from = "help@rmx.party"
  const subject = `Choodle ${choodleId} is officially yours!` // placeholder for CMS content
  const html = `
🌟 Choodle Certificate of Authenticity 🌟
<br />
<img src='data:image/png;${attachment}' alt='Choodle Certificate of Authenticity' />
<br />
🌟 
<p>This certificate guarantees that this Choodle is an original artwork created by ${creatorEmail}.</p>
<p>Made on: ${new Date().toLocaleDateString()}</p>
<p>Edition: 1/1</p>
<p>Creator: ${creatorEmail}</p>
<p><a href=${choodleUrl}>View your Choodle here</a></p>
🌟
<p><a href='https://choodle.xyz'>Choodle :)</a></p>
<p>a project by <a href='https://rmx.party'>rmx.party</a></p>
`

  const msg = {
    to,
    from,
    subject,
    html,
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
