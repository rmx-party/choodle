import {describe, expect, it} from 'vitest';

import Jimp from "jimp";

describe('load an image', () => {
    it('loads the correct file by checking its size', async () => {
        const blankCertificatePath = "/Users/srbaker/Projects/rmx-party/choodle/frontend/src/lib/assets/Choodle-CoA-portrait-blank.png"
        const image = await Jimp.read(blankCertificatePath)

        // FIXME: this needs to come from Sanity
        const testChoodlePath = "/Users/srbaker/Projects/rmx-party/choodle/frontend/src/lib/assets/test-certificate-embeddable-image.png"
        const choodle = await Jimp.read(testChoodlePath)

        image.blit(choodle, 655, 595)
        const font = await Jimp.loadFont(Jimp.FONT_SANS_64_BLACK)

        const createdAt = "2023-07-21T18:15:30.000Z"
        const creatorId = "17527cb1-90c3-453e-a269-d5c141735ce7"

        image.print(font, 400, 1700, `Made on: ${createdAt}`)
        image.print(font, 400, 1780, "Edition: 1/1")
        image.print(font, 400, 1860, `Creator: ${creatorId}`)

        image.write("/tmp/output.png")
    });
});