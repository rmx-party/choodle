import {describe, expect, it} from 'vitest';

import Jimp from "jimp";
import {readOnlyClient} from "$lib/CMSUtils";
import {urlFor} from "$lib/PersistedImagesUtils";
import * as fs from "fs";

describe('load an image', () => {
    it('loads the correct file by checking its size', async () => {
        const blankCertificatePath = "/Users/srbaker/Projects/rmx-party/choodle/frontend/src/lib/assets/CoA-blank.png"
        const image = await Jimp.read(blankCertificatePath)
        const choodleId = "nylCqCwRnhr26khFEUw8oj"

        const choodles = await readOnlyClient.fetch(`*[_type == "choodle" && _id == "${choodleId}"]`)
        const choodleImage = await Jimp.read(urlFor(choodles[0].image).toString())
        choodleImage.scale(3)

        image.blit(choodleImage, 665, 675)
        const font = await Jimp.loadFont(Jimp.FONT_SANS_64_BLACK)

        const createdAt = choodles[0].createdAt
        const creatorId = choodles[0].creatorId

        image.print(font, 400, 1700, `Made on: ${createdAt}`)
        image.print(font, 400, 1780, "Edition: 1/1")
        image.print(font, 400, 1860, `Creator: ${creatorId}`)

        image.write("/tmp/output.png")
    });
});