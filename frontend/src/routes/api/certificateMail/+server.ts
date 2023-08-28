import sgMail from "@sendgrid/mail";
import {SENDGRID_API_KEY} from "$env/static/private";
import {json} from "@sveltejs/kit";

import {getChoodleById, readOnlyClient} from "$lib/CMSUtils";
import {urlFor} from "$lib/PersistedImagesUtils";
import {generateCertificateFor} from "$lib/server/CertificateGenerator";
import {toHTML} from "@portabletext/to-html";

sgMail.setApiKey(SENDGRID_API_KEY)

export const POST = async ({request, cookies}) => {
    const certificateEmail = await readOnlyClient.fetch(`*[_type == "CertificateEmail"] [0]`);

    console.log(`mail request`, request)

    const {creatorEmail, choodleId, ...unknown} = await request.json()
    console.log({creatorEmail, choodleId, unknown})

    const choodle = await getChoodleById(choodleId)
    const choodleImageUrl = urlFor(choodle.image)

    const fetchedImage = await fetch(choodleImageUrl.url());
    const attachment = Buffer.from(await fetchedImage.arrayBuffer()).toString("base64")
    const certificateAttachment = await generateCertificateFor({choodleId, creatorEmail})

    const choodleUrl = `https://choodle.xyz/c/${choodleId}`

    const to = creatorEmail
    const from = "help@rmx.party"
    const subject = certificateEmail.emailSubject
    const html = `
${toHTML(certificateEmail.top)}
<br />
<img width="300" src='data:image/png;base64,${certificateAttachment}' alt='Choodle Certificate of Authenticity' />
<br />
${toHTML(certificateEmail.createdBy)} ${creatorEmail}.
<br/>
<p>Made on: ${new Date(choodle._createdAt).toLocaleDateString()}</p>
<p>Edition: 1/1</p>
<p>Creator: ${creatorEmail}</p>
<p><a href=${choodleUrl}>View your Choodle here</a></p>
${toHTML(certificateEmail.footer)}
`

    const msg = {
        to,
        from,
        subject,
        html,
        attachments: [
            {
                content: attachment,
                filename: `choodle-${choodleId}.png`,
                type: "application/png",
                disposition: "attachment"
            },
            {
                content: certificateAttachment,
                filename: `choodle-certificate-${choodleId}.png`,
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
    const {statusCode, body} = sgResponse[0]

    return json({statusCode, body})
}
