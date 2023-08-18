import hre, {ethers} from "hardhat";

async function main() {
    const choodleFest = await ethers.deployContract("ChoodleFEST")
    await choodleFest.waitForDeployment()

    console.log("deployed to:", await choodleFest.target);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
