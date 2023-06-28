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

    const provider = new ethers.providers.Web3Provider(magic.rpcProvider);
    const accounts = await magic.wallet.connectWithUI();

    //// funds check
    //// redirect to the minting modal

    const contractAddress = PUBLIC_CONTRACT_ADDRESS
    if (!(contractAddress?.length > 0)) {
        throw new Error(`ENV var PUBLIC_CONTRACT_ADDRESS not set`)
    }

    const contract = new ethers.Contract(contractAddress, abi, provider.getSigner())
    const receipt = await contract.safeMint(accounts[0], 'foooooooooooo')
    console.log('receipt', receipt)
}

if (browser) {
    await setUpMagic();
}
