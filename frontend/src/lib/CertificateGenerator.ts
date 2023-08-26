import Jimp from "jimp";
import {getChoodleById} from "$lib/CMSUtils";
import {urlFor} from "$lib/PersistedImagesUtils";
import {temporaryFileTask} from "tempy";
import fs from "fs";
import { dirname } from 'path';
import { fileURLToPath } from 'url';
import path from "path";

export const generateCertificateFor = async ({choodleId, creatorEmail}) => {

    const __dirname = dirname(fileURLToPath(import.meta.url));
    const cwdLib = path.join(process.cwd(), 'src', 'lib');
    const certBackground = `${cwdLib}/assets/CoA-blank.png`
    console.log({__dirname, certBackground, cwdLib})

    const image = await Jimp.read(certBackground)

    const choodle = await getChoodleById(choodleId)
    const choodleImage = await Jimp.read(urlFor(choodle.image).url())
    choodleImage.scale(3)

    image.blit(choodleImage, 665, 675)
    const font = await Jimp.loadFont(Jimp.FONT_SANS_64_BLACK)

    const creationDate = new Date(choodle._createdAt).toLocaleDateString()

    image.print(font, 400, 1700, `Made on: ${creationDate}`)
    image.print(font, 400, 1780, "Edition: 1/1")
    image.print(font, 400, 1860, `Creator: ${creatorEmail}`)


    return await temporaryFileTask(async tempFile => {
        console.log({tempFile})
        await image.writeAsync(tempFile)
        const readFile = fs.readFileSync(tempFile, "base64")
        return readFile
    }, { extension: 'png' });
}
