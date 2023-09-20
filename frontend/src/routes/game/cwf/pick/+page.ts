import {readOnlyClient} from "$lib/CMSUtils";

export const ssr = false;

export async function load({params}) {
    const records = await readOnlyClient.fetch(`*[_type == "gamePrompt"]`);

    if (records) {
        console.log({records})
        return {records};
    }
    return {
        status: 500,
        body: new Error("Internal Server Error")
    };
}
