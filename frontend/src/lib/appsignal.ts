import Appsignal from "@appsignal/javascript";
import { PUBLIC_APPSIGNAL_PUSH_API_KEY } from "$env/static/public";

console.log(`Appsignal: ${PUBLIC_APPSIGNAL_PUSH_API_KEY}`)
export const appsignal = new Appsignal({
  key: `${PUBLIC_APPSIGNAL_PUSH_API_KEY}`
});

