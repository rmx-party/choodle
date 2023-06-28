import {HardhatUserConfig} from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";

import "hardhat-gas-reporter"
import "hardhat-abi-exporter"

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
    etherscan: {
        apiKey: {
            polygonMumbai: `${process.env.POLYGONSCAN_API_KEY}`,
        }
    }
};

export default config;
