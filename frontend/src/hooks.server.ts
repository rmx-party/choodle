import {Appsignal} from "@appsignal/nodejs";

console.log(`Appsignal key: ${process.env.APPSIGNAL_PUSH_API_KEY}`)
new Appsignal({
  active: true,
  name: "Choodle",
  pushApiKey: `${process.env.APPSIGNAL_PUSH_API_KEY}`
});
