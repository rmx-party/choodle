import hre from "hardhat";

async function main() {
    const NFT = await hre.ethers.getContractFactory("MyToken");
    const nft = await NFT.deploy();

    nft.deploymentTransaction();

    console.log("deployed to:", await nft.getAddress());
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
