import {Magic} from "magic-sdk";
import {ethers} from "ethers";
import {PUBLIC_CONTRACT_ADDRESS, PUBLIC_MAGIC_API_KEY} from "$env/static/public";
import abi from '../abi/MyToken.json'
import {getUndoStack} from "$lib/CanvasStuff";

async function connectMagic() {
    const magic = new Magic(PUBLIC_MAGIC_API_KEY, {
        network: {
            rpcUrl: 'https://matic-mumbai.chainstacklabs.com',
            chainId: 80001
        }
    });

    const provider = new ethers.providers.Web3Provider(magic.rpcProvider);
    const accounts = await magic.wallet.connectWithUI();

    return {provider, accounts};
}

async function mint(accounts: string[], provider: ethers.providers.Web3Provider, imageData: string) {
    const contractAddress = PUBLIC_CONTRACT_ADDRESS
    if (!(contractAddress?.length > 0)) {
        throw new Error(`ENV var PUBLIC_CONTRACT_ADDRESS not set`)
    }

    const data = 'data:application/json;base64,' + btoa(JSON.stringify({
        "description": `Drawing by ${accounts[0]}`,
        "image": `${imageData}`,
        "name": "TBA"
    }))

    const contract = new ethers.Contract(contractAddress, abi, provider.getSigner())

    return await contract.safeMint(accounts[0], data)
}

export function generateOpenSeaURL(tokenId: number) {
    const openSeaPrefix = "https://testnets.opensea.io/assets/mumbai"
    return `${openSeaPrefix}/${PUBLIC_CONTRACT_ADDRESS}/${tokenId}`
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

    const eventsWithTokenId = receipt.events.findFirst((event: any) => {
        return event.args.tokenId !== undefined
    })
    console.log(eventsWithTokenId)
}
