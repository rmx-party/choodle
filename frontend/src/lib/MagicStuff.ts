import {Magic} from "magic-sdk";
import {ethers} from "ethers";
import {
    PUBLIC_CONTRACT_ADDRESS,
    PUBLIC_MAGIC_API_KEY,
    PUBLIC_ALCHEMY_RPC_URL,
    PUBLIC_CHAIN_ID,
    PUBLIC_OPENSEA_PREFIX
} from "$env/static/public";
import abi from '../abi/ChoodleFEST.json'
import {loading} from "$lib/store";
import fp from 'lodash/fp'

export function magicFactory() {
    console.log(`magic factory configuration`, {
        PUBLIC_CONTRACT_ADDRESS,
        PUBLIC_MAGIC_API_KEY,
        PUBLIC_ALCHEMY_RPC_URL,
        PUBLIC_CHAIN_ID,
        PUBLIC_OPENSEA_PREFIX,
        abi
    })

    // const customNodeOptions = 'ethereum';
    // const customNodeOptions = {
    //     rpcUrl: 'https://polygon-rpc.com/', // Polygon RPC URL
    //     chainId: 137, // Polygon chain id
    // }
    const customNodeOptions = {
        rpcUrl: PUBLIC_ALCHEMY_RPC_URL,
        chainId: Number(PUBLIC_CHAIN_ID),
    }

    const magic = new Magic(PUBLIC_MAGIC_API_KEY, {
        network: customNodeOptions
    });
    magic.preload().then(() => console.log(`magic preloaded`, magic)); // start fetching the iframe junk ahead of time
    return magic;
}

async function connectMagic() {
    const magic = magicFactory();
    const provider = new ethers.providers.Web3Provider(magic.rpcProvider);
    let accounts;

    console.log(`magic initialized`, magic, provider);

    if (magic.rpcProvider.connected) {
        accounts = await provider.listAccounts();
    } else {
        accounts = await magic.wallet.connectWithUI();
    }
    console.log(`listaccounts`, await provider.listAccounts())
    if (provider.blockNumber < 1000) {
        throw new Error(`provider connection problem, block number ${provider.blockNumber} too low`)
    } else {
        return {provider, accounts, magic};
    }
}

async function mint(accounts: string[], provider: ethers.providers.Web3Provider, imageData: string, creatorId: string, createdAt: string, magic) {
    const contractAddress = PUBLIC_CONTRACT_ADDRESS
    if (!(contractAddress?.length > 0)) {
        throw new Error(`ENV var PUBLIC_CONTRACT_ADDRESS not set`)
    }
    const createdAtEpoch = new Date(createdAt).valueOf()

    // FIXME: this should be done by the contract, and use the real ID
    const data = 'data:application/json;base64,' + btoa(JSON.stringify({
        "description": `This collection of Choodles was made by attendees who participated in our private beta at FWB FEST 2023 at Idyllwild Arts Academy, Idyllwild, CA.`,
        "attributes": [
            {
                "trait_type": "Creator ID",
                "value": `${creatorId}`
            },
            {
                "display_type": "date",
                "trait_type": "Created At",
                "value": createdAtEpoch
            }
        ],
        "image": `${imageData}`,
        "name": `Choodle`
    }))

    const signer = provider.getSigner(accounts[0])
    console.log(`signer`, signer)
    const address = await signer.getAddress()
    console.log(`getAddress`, address)

    const balance = await provider.getBalance(address)
    console.log(`getBalance`, ethers.utils.formatEther(balance))

    const contract = new ethers.Contract(contractAddress, abi, signer)
    console.log(`contract`, contract)

    console.log(`provider state`, provider)

    // return await contract.setContractURI('foo2')
    //     .catch((err) => {
    //         // TODO: run a reboot callback to reload canvas etc
    //         loading.set(false)
    //         console.error(err)
    //     });
    return await contract.safeMint(address, data)
        .catch((err) => {
            // TODO: run a reboot callback to reload canvas etc
            loading.set(false)
            console.error(err)
        });
}

export function generateOpenSeaURL(tokenId: number | string) {
    return `${PUBLIC_OPENSEA_PREFIX}/${PUBLIC_CONTRACT_ADDRESS}/${tokenId}`
}

export async function connectAndMint(imageData: string, creatorId: string, createdAt: string) {
    if (!imageData) console.error(`image data missing, please fix teh code`)

    loading.set(true)
    const {provider, accounts, magic} = await connectMagic()
        .catch((err) => {
            // TODO: run a reboot callback to reload canvas etc
            loading.set(false);
            console.error(err);
            return Promise.resolve({provider: null, accounts: [], magic: null});
        })
    console.log(`provider and accounts and magic`, provider, accounts, magic);
    if (!provider || accounts.length < 1) return null;
    console.log(`pre mint wallet info`, await magic?.wallet.getInfo())
    console.log(`magic user logged in?`, await magic.user.isLoggedIn())

    const preReceipt = await mint(accounts, provider, imageData, creatorId, createdAt, magic);
    console.log(`preReceipt`, preReceipt)

    const receipt = await preReceipt.wait()
        .catch((error) => {
            // TODO: run a reboot callback to reload canvas etc
            loading.set(false)
            console.error(error)
        });

    console.log(`final receipt`, receipt)
    loading.set(false)

    const tokenId = fp.first(fp.compact(fp.map(bigNumber => bigNumber?.toNumber())(fp.map(event => event.args?.tokenId)(receipt.events))))
    return tokenId
}

export async function sendAChoodle(tokenId) {
    console.log(`sendAchoodle called`, tokenId, event)
    if (!tokenId) return console.error(`need to pass the tokenId`)

    const to = prompt('send to what address')
    if (!to) return console.error(`need to pass the recipient address as 'to'`)

    loading.set(true)
    const {provider, accounts, magic} = await connectMagic()
        .catch((err) => {
            // TODO: run a reboot callback to reload canvas etc
            loading.set(false);
            console.error(err);
            return Promise.resolve({provider: null, accounts: [], magic: null});
        })
    console.log(`provider and accounts and magic`, provider, accounts, magic);
    if (!provider || accounts.length < 1) return null;

    const contractAddress = PUBLIC_CONTRACT_ADDRESS
    if (!(contractAddress?.length > 0)) {
        throw new Error(`ENV var PUBLIC_CONTRACT_ADDRESS not set`)
    }
    const signer = provider.getSigner(accounts[0])
    console.log(`signer`, signer)
    const address = await signer.getAddress()
    console.log(`getAddress`, address)

    const contract = new ethers.Contract(contractAddress, abi, signer)
    console.log(`contract`, contract)

    const preReceipt = await contract.safeTransferFrom(address, to, tokenId)
        .catch((err) => {
            // TODO: run a reboot callback to reload canvas etc
            loading.set(false)
            console.error(err)
        });
    console.log(`preReceipt`, preReceipt)

    const receipt = await preReceipt.wait()
        .catch((error) => {
            // TODO: run a reboot callback to reload canvas etc
            loading.set(false)
            console.error(error)
        });

    console.log(`final receipt`, receipt)
    loading.set(false)
    return to;
}

export async function showMagicWallet() {
    const magic = magicFactory()
    if ((await magic.wallet.getInfo()).walletType === 'magic') {
        await magic.wallet.showUI();
    }
}
