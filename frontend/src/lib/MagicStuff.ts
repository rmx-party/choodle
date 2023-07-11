import {Magic} from "magic-sdk";
import {ethers} from "ethers";
import {
    PUBLIC_CONTRACT_ADDRESS,
    PUBLIC_MAGIC_API_KEY,
    PUBLIC_ALCHEMY_RPC_URL,
    PUBLIC_OPENSEA_PREFIX
} from "$env/static/public";
import abi from '../abi/MyToken.json'
import {getUndoStack} from "$lib/CanvasStuff";
import fp from 'lodash/fp'

export function magicFactory() {
    const magic = new Magic(PUBLIC_MAGIC_API_KEY, {
        network: {
            rpcUrl: PUBLIC_ALCHEMY_RPC_URL,
            chainId: 80001
        }
    });
    return magic;
}

async function connectMagic() {
    const magic = magicFactory();

    const provider = new ethers.providers.Web3Provider(magic.rpcProvider);
    const accounts = await magic.wallet.connectWithUI();

    return {provider, accounts};
}

async function mint(accounts: string[], provider: ethers.providers.Web3Provider, imageData: string) {
    const contractAddress = PUBLIC_CONTRACT_ADDRESS
    if (!(contractAddress?.length > 0)) {
        throw new Error(`ENV var PUBLIC_CONTRACT_ADDRESS not set`)
    }

    // FIXME: this should be done by the contract, and use the real ID
    const data = 'data:application/json;base64,' + btoa(JSON.stringify({
        "description": `Drawing by ${accounts[0]}`,
        "image": `${imageData}`,
        "name": `Choodle #${'TBD'}`
    }))

    const contract = new ethers.Contract(contractAddress, abi, provider.getSigner())

    return await contract.safeMint(accounts[0], data)
}

export function generateOpenSeaURL(tokenId: number | string) {
    return `${PUBLIC_OPENSEA_PREFIX}/${PUBLIC_CONTRACT_ADDRESS}/${tokenId}`
}

export async function connectAndMint() {
    const undoStack = await getUndoStack()
    const imageData = undoStack.current
    if (!imageData) console.error(`image data missing, please fix teh code`)

    const {provider, accounts} = await connectMagic();

    const preReceipt = await mint(accounts, provider, imageData);
    console.log(preReceipt)

    const receipt = await preReceipt.wait();
    console.log(receipt)

    const tokenId = fp.first(fp.compact(fp.map(bigNumber => bigNumber?.toNumber())(fp.map(event => event.args?.tokenId)(receipt.events))))
    return tokenId
}
