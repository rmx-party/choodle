import {ethers} from "hardhat";

const fs = require('fs');
const path = require('path')

describe("MyToken", function () {
    it("Deployment should assign the total supply of tokens to the owner", async function () {
        const [owner, recipient1, recipient2] = await ethers.getSigners();

        const mintMePlease = fs.readFileSync(path.join(__dirname, './scratch.base64'), {encoding: 'ascii'})

        const myToken = await ethers.deployContract("MyToken");

        console.log(await myToken.safeMint(recipient2, mintMePlease))
    });
});
