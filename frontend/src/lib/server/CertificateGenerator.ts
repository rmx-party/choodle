import Jimp from "jimp";
import {getChoodleById, readOnlyClient} from "$lib/CMSUtils";
import {urlFor} from "$lib/PersistedImagesUtils";
import {temporaryFileTask} from "tempy";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import {PUBLIC_URL_BASE} from "$env/static/public";
import QRCode from 'qrcode';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export const generateCertificateFor = async ({choodleId, creatorEmail}) => {
    const certificateEmail = await readOnlyClient.fetch(`*[_type == "CertificateEmail"] [0]`);

    const blankCertificateImageUrl = urlFor(certificateEmail.blankCertificate).url();
    const image = await Jimp.read(blankCertificateImageUrl)

    const choodle = await getChoodleById(choodleId)
    const choodleImage = await Jimp.read(urlFor(choodle.image).url())
    choodleImage.scale(3)

    image.blit(choodleImage, 665, 675)
    const font = await Jimp.loadFont(`${PUBLIC_URL_BASE}/open-sans/open-sans-64-black/open-sans-64-black.fnt`)

    const creationDate = new Date(choodle._createdAt).toLocaleDateString()

    image.print(font, 400, 1700, `Made on: ${creationDate}`)
    image.print(font, 400, 1780, "Edition: 1/1")
    image.print(font, 400, 1860, `Creator: ${creatorEmail}`)

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
