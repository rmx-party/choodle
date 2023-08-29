import { PUBLIC_URL_BASE } from "$env/static/public";
import { getChoodleById, readOnlyClient } from "$lib/CMSUtils";
import { urlFor } from "$lib/PersistedImagesUtils";
import { toHTML } from "@portabletext/to-html";
import fs from "fs";
import Jimp from "jimp";
import QRCode from 'qrcode';
import { temporaryFileTask } from "tempy";

export const generateCertificateFor = async ({choodleId, creatorEmail}: {choodleId: string, creatorEmail: string}) => {
    const certificateEmail = await readOnlyClient.fetch(`*[_type == "CertificateEmail"] [0]`);

    const blankCertificateImageUrl = urlFor(certificateEmail.blankCertificate).url();
    const image = await Jimp.read(blankCertificateImageUrl)

    const choodle = await getChoodleById(choodleId)
    const choodleImage = await Jimp.read(urlFor(choodle.image).url())
    choodleImage.scale(3)

    image.blit(choodleImage, 665, 675)
    const font = await Jimp.loadFont(`${PUBLIC_URL_BASE}/open-sans/open-sans-64-black/open-sans-64-black.fnt`)
    const fontHeader = await Jimp.loadFont(`${PUBLIC_URL_BASE}/open-sans/open-sans-128-black/open-sans-128-black.fnt`)

    const creationDate = new Date(choodle._createdAt).toLocaleDateString()
    const creatorString = `${certificateEmail.createdBy} ${creatorEmail}`

    image.print(fontHeader, 215, 458, `Certificate™ of Ownership`)
    image.print(font, 194, 1563, creatorString, 1600, 150)

    image.print(font, 197, 1737, `Made on: `)
    image.print(font, 515, 1737, `${creationDate}`)
    image.print(font, 197, 1804, "Edition: ")
    image.print(font, 515, 1804, "1/1")
    image.print(font, 198, 1871, `Creator: `)
    image.print(font, 515, 1871, `${creatorEmail}`)

    const qrcode = await QRCode.toDataURL( `${PUBLIC_URL_BASE}/c/${choodleId}`, { errorCorrectionLevel: 'L', scale: 8 })
    const qrcodeImage = await Jimp.read(Buffer.from(qrcode.split(',')[1], 'base64'))
    image.blit(qrcodeImage, 1300, 2100)

    return await temporaryFileTask(async tempFile => {
        console.log({tempFile})
        await image.writeAsync(tempFile)
        const readFile = fs.readFileSync(tempFile, "base64")
        return readFile
    }, { extension: 'png' });
}
