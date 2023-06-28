import {Magic} from "magic-sdk";
import {browser} from "$app/environment";
import {ethers} from "ethers";
import {PUBLIC_CONTRACT_ADDRESS, PUBLIC_MAGIC_API_KEY} from "$env/static/public";
import abi from '../../abi/MyToken.json'

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

    const receipt = await contract.safeMint(accounts[0], data)
    console.log('receipt', receipt)
}

async function connectAndMint() {
    const {provider, accounts} = await connectMagic();

    const imageData = 'data:image/png;base64,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'
    await mint(accounts, provider, imageData);
}

if (browser) {
    await connectAndMint();
}
