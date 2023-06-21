import {Magic} from "magic-sdk";
import {PUBLIC_MAGIC_API_KEY} from '$env/static/public';
import {browser} from "$app/environment";

if (browser) {
    const magic = new Magic(PUBLIC_MAGIC_API_KEY, {
        network: {
            rpcUrl: 'https://matic-mumbai.chainstacklabs.com',
            chainId: 80001
        }
    });
}
