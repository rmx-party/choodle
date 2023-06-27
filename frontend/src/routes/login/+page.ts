import {Magic} from "magic-sdk";
import {browser} from "$app/environment";
import {ethers} from "ethers";
import {PUBLIC_CONTRACT_ADDRESS, PUBLIC_MAGIC_API_KEY} from "$env/static/public";
import abi from '../../abi/MyToken.json'

async function setUpMagic() {
    const magic = new Magic(PUBLIC_MAGIC_API_KEY, {
        network: {
            rpcUrl: 'https://matic-mumbai.chainstacklabs.com',
            chainId: 80001
        }
    });

    const {ethereum} = window as any;
    const magicProvider = await magic.wallet.getProvider();
    const browserProvider = new ethers.BrowserProvider(magicProvider)

    const accounts = await magic.wallet.connectWithUI();

    const walletInfo = await magic.user.getInfo();
    console.log(walletInfo);

    await magic.wallet.showUI();
    // funds check
    // redirect to the minting modal

    const contractAddress = PUBLIC_CONTRACT_ADDRESS
    console.log(`contract:`, contractAddress)
    if (!(contractAddress?.length > 0)) {
        throw new Error(`ENV var VITE_CONTRACT_ADDRESS not set`)
    }

    const signer = await browserProvider.getSigner();
    const contract = new ethers.Contract(accounts[0], abi, signer)


    const receipt = await contract.safeMint.send(accounts[0], 'fooooooooooooooo')
    console.log(receipt)
    console.log(await receipt.isMined())
}

if (browser) {
    await setUpMagic();
}
