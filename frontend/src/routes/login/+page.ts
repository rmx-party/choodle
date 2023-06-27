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

    const provider = await magic.wallet.getProvider();
    const web3Provider = new ethers.BrowserProvider(window.ethereum)
    const accounts = await magic.wallet.connectWithUI();

    const walletInfo = await magic.user.getInfo();
    console.log(walletInfo);

    await magic.wallet.showUI();
    // funds check
    // redirect to the minting modal

    const web3 = new ethers.JsonRpcProvider('https://matic-mumbai.chainstacklabs.com')
    const contractAddress = PUBLIC_CONTRACT_ADDRESS
    console.log(`contract:`, contractAddress)
    if (!(contractAddress?.length > 0)) {
        throw new Error(`ENV var VITE_CONTRACT_ADDRESS not set`)
    }
    const contract = new ethers.Contract(accounts[0], abi, web3Provider)
    const gasEstimation = await
        contract.safeMint.estimateGas(accounts[0], 'foooobar')
    console.log('estimated gas: ', gasEstimation)
}

if (browser) {
    await setUpMagic();
}
