import {Magic} from "magic-sdk";
import {browser} from "$app/environment";
import {ethers} from "ethers";
import {PUBLIC_MAGIC_API_KEY} from "$env/static/public";

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
}

if (browser) {
    await setUpMagic();
}
