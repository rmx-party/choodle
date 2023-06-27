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
        enabled: true,
        currency: 'USD',
        gasPrice: 28,
        coinmarketcap: process.env.COINMARKETCAP_API_KEY
    },
};

export default config;
