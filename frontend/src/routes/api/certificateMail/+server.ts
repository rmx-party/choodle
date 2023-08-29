import sgMail from "@sendgrid/mail";
import {SENDGRID_API_KEY} from "$env/static/private";
import {json} from "@sveltejs/kit";

import {getChoodleById, readOnlyClient, readWriteClient} from "$lib/CMSUtils";
import {urlFor} from "$lib/PersistedImagesUtils";
import {generateCertificateFor} from "$lib/server/CertificateGenerator";
import {toHTML} from "@portabletext/to-html";
import {PUBLIC_URL_BASE} from "$env/static/public";
import dataUriToBuffer from "$lib/dataUriToBuffer";

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
    const certificateUploadResult = await readWriteClient.assets.upload('image', supposedBuffer, {timeout: 5000})

    const newChoodle = await readWriteClient.patch(choodle._id).set({
        certificate: {
            _type: "image",
            asset: {
                _type: "reference",
                _ref: certificateUploadResult?._id,
            }
        }
    }).commit();

    const choodleUrl = `${PUBLIC_URL_BASE}/c/${choodleId}`

    const to = creatorEmail
    const from = {email: "help@rmx.party", name: "RMX Party"}
    const bcc = [{ email: "help@rmx.party", name: "RMX Party" }]
    const subject = `${certificateEmail.emailSubject} ${choodleId}`
    const html = `
${toHTML(certificateEmail.top)}
<br />
<img width="300" src=${urlFor(newChoodle.certificate).width(300).url()} alt='Choodle Certificate of Ownership' />
<br />
<p>${certificateEmail.createdBy} ${creatorEmail}.</p>
<p><strong>Made on:</strong> ${new Date(choodle._createdAt).toLocaleDateString()}
<br/>
<strong>Edition:</strong> 1/1
<br/>
<strong>Creator:</strong> ${creatorEmail}
</p>
<p><a href=${choodleUrl}>View your Choodle here</a></p>
${toHTML(certificateEmail.footer)}
`

    const msg = {
        to,
        from,
        bcc,
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
        .then((response) => {
            console.log(`Email sent to ${creatorEmail} for Choodle ${choodleId}`)
            return response;
        })
        .catch((error) => {
            console.error(error)
            return [{
                body: error,
                statusCode: 500,
            }, ''];
        })
    console.log({sgResponse})
    const {statusCode, body} = sgResponse[0]

    return json({statusCode, body})
}
