import {HardhatUserConfig} from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";

import "hardhat-gas-reporter"
import "hardhat-abi-exporter"

const config: HardhatUserConfig = {
    solidity: {
        version: "0.8.19",
        settings: {
            optimizer: {
                enabled: true,
                runs: 1000,
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
            url: "https://endpoints.omniatech.io/v1/matic/mumbai/public	",
            accounts: [`0x${process.env.RMXHACKS_PRIVATE_KEY}`],
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
};

export default config;
