import {HardhatUserConfig} from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";

import "hardhat-gas-reporter"

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
        hardhat: {
            accounts: {
                accountsBalance: "1000000000000000000000000000",
            }
        }
    }
};

export default config;
