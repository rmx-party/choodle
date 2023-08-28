import sgMail from "@sendgrid/mail";
import {SENDGRID_API_KEY} from "$env/static/private";
import {json} from "@sveltejs/kit";

import {getChoodleById, readOnlyClient, readWriteClient} from "$lib/CMSUtils";
import {urlFor} from "$lib/PersistedImagesUtils";
import {generateCertificateFor} from "$lib/server/CertificateGenerator";
import {toHTML} from "@portabletext/to-html";
import dataUriToBuffer from "data-uri-to-buffer";
import {PUBLIC_URL_BASE} from "$env/static/public";

sgMail.setApiKey(SENDGRID_API_KEY)

const b64toBlob = (b64Data, contentType = '', sliceSize = 512) => {
    const byteCharacters = atob(b64Data);
    const byteArrays = [];

    for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
        const slice = byteCharacters.slice(offset, offset + sliceSize);

        const byteNumbers = new Array(slice.length);
        for (let i = 0; i < slice.length; i++) {
            byteNumbers[i] = slice.charCodeAt(i);
        }

        const byteArray = new Uint8Array(byteNumbers);
        byteArrays.push(byteArray);
    }

    const blob = new Blob(byteArrays, {type: contentType});
    return blob;
}

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
    const certificateDataUri = `data:image/png;base64,${certificateAttachment}`;
    const supposedBuffer = dataUriToBuffer(certificateDataUri);
    const uploadResult = readWriteClient.assets.upload('image', supposedBuffer, {timeout: 5000})

    await readWriteClient.patch(choodle._id).set({
        certificate: {
            _type: "image",
            asset: {
                _type: "reference",
                _ref: (await uploadResult)?._id,
            }
        }
    }).commit();

    const choodleUrl = `${PUBLIC_URL_BASE}/c/${choodleId}`

    const to = creatorEmail
    const from = "help@rmx.party"
    const subject = certificateEmail.emailSubject
    const html = `
${toHTML(certificateEmail.top)}
<br />
<img width="300" src=${certificateDataUri} alt='Choodle Certificate of Authenticity' />
<br />
${toHTML(certificateEmail.createdBy)} ${creatorEmail}.
<br/>
<p>Made on: ${new Date(choodle._createdAt).toLocaleDateString()}
<br/>
Edition: 1/1
<br/>
Creator: ${creatorEmail}
</p>

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
