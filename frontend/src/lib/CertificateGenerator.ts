import Jimp from "jimp";
import {getChoodleById} from "$lib/CMSUtils";
import {urlFor} from "$lib/PersistedImagesUtils";
import {temporaryFile, temporaryFileTask} from "tempy";

import {fileURLToPath} from "url";
import {dirname} from "path";
import fs from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export const generateCertificateFor = async (choodleId: string) => {
    const image = await Jimp.read(`${__dirname}/assets/CoA-blank.png`)

    const choodle = await getChoodleById(choodleId)
    const choodleImage = await Jimp.read(urlFor(choodle.image).url())
    choodleImage.scale(3)

    image.blit(choodleImage, 665, 675)
    const font = await Jimp.loadFont(Jimp.FONT_SANS_64_BLACK)

    const createdAt = choodle.createdAt
    const creatorId = choodle.creatorId

    image.print(font, 400, 1700, `Made on: ${createdAt}`)
    image.print(font, 400, 1780, "Edition: 1/1")
    image.print(font, 400, 1860, `Creator: ${creatorId}`)


    return await temporaryFileTask(async tempFile => {
        console.log(tempFile)
        await image.writeAsync(tempFile)
        const readFile = fs.readFileSync(tempFile, "base64")
        return readFile
    }, { extension: 'png' });
}
