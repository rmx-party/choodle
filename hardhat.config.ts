import {HardhatUserConfig, task} from "hardhat/config";

import "@nomicfoundation/hardhat-toolbox";
import "@nomicfoundation/hardhat-ledger";

import "hardhat-gas-reporter"
import "hardhat-abi-exporter"
import { ethers } from "ethers";

const RMX_PROD_CONTRACT_DEPLOYER = `0xF16F1201aECae83778458A39Af2605c9D0C61b1E`;

const config: HardhatUserConfig = {
    solidity: {
        version: "0.8.19",
        settings: {
            viaIR: true,
            optimizer: {
                enabled: true,
                runs: 9000,
            },
        },
    },
    gasReporter: {
        enabled: (process.env.REPORT_GAS) ? true : false,
        currency: 'USD',
        coinmarketcap: process.env.COINMARKETCAP_API_KEY,
        token: 'MATIC',
        gasPriceApi: 'https://api.polygonscan.com/api?module=proxy&action=eth_gasPrice'
    },
    networks: {
        hardhat: {},
        mumbai: {
            url: "https://polygon-mumbai.blockpi.network/v1/rpc/public",
            accounts: [
                `0x${process.env.RMXHACKS_PRIVATE_KEY}`,
            ],
        },
        polygon: {
            url: `https://polygon.llamarpc.com`,
            ledgerAccounts: [
                RMX_PROD_CONTRACT_DEPLOYER
            ],
        }
    },
    abiExporter: {
        path: './frontend/src/abi',
        clear: true,
        runOnCompile: true,
        flat: true,
        spacing: 2,
        format: 'json'
    },
    etherscan: {
        apiKey: {
            polygonMumbai: `${process.env.POLYGONSCAN_API_KEY}`,
        }
    }
};

export default config;

task('rmx-deploy', 'Deploys a specified contract, remember to flag which network')
    .addParam('contract', 'the name of the smart contract to deploy')
    .setAction(async (taskArgs, hre) => {
        async function deploy() {
            const contract = await hre.ethers.deployContract(taskArgs.contract)
            console.log(`deploying to ${hre.network} with target:`, contract.target;

            await contract.waitForDeployment()

            console.log("deployed to address:", await contract.getAddress());
            console.log("deployed in transaction:", contract.deploymentTransaction());
        }

        await deploy().catch((error) => {
            console.error(error);
            process.exitCode = 1;
        });
    })

