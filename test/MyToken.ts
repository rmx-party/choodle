import {ethers} from "hardhat";
import {expect} from "chai";

const fs = require('fs');
const path = require('path')

describe("MyToken", function () {
    it("doesn't fail when saving a small image", async function () {
        const [owner, recipient1, recipient2] = await ethers.getSigners();

        const mintMePlease = fs.readFileSync(path.join(__dirname, './64x64-tnt.png.base64'), {encoding: 'ascii'})

        const myToken = await ethers.deployContract("MyToken");

        expect(await myToken.safeMint(recipient2, mintMePlease)).not.Throw
    });
});
