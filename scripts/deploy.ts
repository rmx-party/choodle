import hre, {ethers} from "hardhat";

async function main() {
    const myToken = await ethers.deployContract("MyToken")
    await myToken.waitForDeployment()

    console.log("deployed to:", await myToken.target);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
