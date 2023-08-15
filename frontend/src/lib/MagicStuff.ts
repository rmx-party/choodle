import {Magic} from "magic-sdk";
import {ethers} from "ethers";
import {
    PUBLIC_CONTRACT_ADDRESS,
    PUBLIC_MAGIC_API_KEY,
    PUBLIC_ALCHEMY_RPC_URL,
    PUBLIC_OPENSEA_PREFIX
} from "$env/static/public";
import abi from '../abi/MyToken.json'
import {loading} from "$lib/store";
import fp from 'lodash/fp'
import {getUndoStack} from "$lib/StorageStuff";

export function magicFactory() {
    const magic = new Magic(PUBLIC_MAGIC_API_KEY, {
        network: {
            rpcUrl: PUBLIC_ALCHEMY_RPC_URL,
            chainId: 80001
        }
    });
    magic.preload; // start fetching the iframe junk ahead of time
    return magic;
}

async function connectMagic() {
    const magic = magicFactory();

    const provider = new ethers.providers.Web3Provider(magic.rpcProvider);
    const accounts = await magic.wallet.connectWithUI();

    return {provider, accounts};
}

async function mint(accounts: string[], provider: ethers.providers.Web3Provider, imageData: string, creatorId: string) {
    const contractAddress = PUBLIC_CONTRACT_ADDRESS
    if (!(contractAddress?.length > 0)) {
        throw new Error(`ENV var PUBLIC_CONTRACT_ADDRESS not set`)
    }

    // FIXME: this should be done by the contract, and use the real ID
    const data = 'data:application/json;base64,' + btoa(JSON.stringify({
        "description": `Drawing by ${accounts[0]}`,
        "attributes": [
            {
                "trait_type": "Creator ID",
                "value": `${creatorId}`
            }
        ],
        "image": `${imageData}`,
        "name": `Choodle #${'TBD'}`
    }))

    const contract = new ethers.Contract(contractAddress, abi, provider.getSigner())

    return await contract.safeMint(accounts[0], data)
        .catch((error) => {
            // TODO: run a reboot callback to reload canvas etc
            loading.set(false)
            console.error(error)
        });
}

export function generateOpenSeaURL(tokenId: number | string) {
    return `${PUBLIC_OPENSEA_PREFIX}/${PUBLIC_CONTRACT_ADDRESS}/${tokenId}`
}

export async function connectAndMint(imageData: string, creatorId: string) {
    if (!imageData) console.error(`image data missing, please fix teh code`)

    loading.set(true)
    const {provider, accounts} = await connectMagic()
        .catch((error) => {
            // TODO: run a reboot callback to reload canvas etc
            loading.set(false)
            console.error(error)
        });

    const preReceipt = await mint(accounts, provider, imageData, creatorId);
    console.log(preReceipt)

    const receipt = await preReceipt.wait()
        .catch((error) => {
            // TODO: run a reboot callback to reload canvas etc
            loading.set(false)
            console.error(error)
        });

    console.log(receipt)
    loading.set(false)

    const tokenId = fp.first(fp.compact(fp.map(bigNumber => bigNumber?.toNumber())(fp.map(event => event.args?.tokenId)(receipt.events))))
    return tokenId
}
