import {readOnlyClient} from "$lib/CMSUtils";

export const ssr = false;

export async function load({params}) {
    const promptData = await readOnlyClient.fetch(`*[_type == "dailyPrompt"] | order(_createdAt) [0]`);
    const howtoData = await readOnlyClient.fetch(`*[_type == "howto"] | order(_createdAt) [0]`);

    // FIXME: I suspect we can do _one_ query for both things.

    if (promptData || howtoData) {
        console.log(`load data: `, promptData)
        return {
            prompt: promptData,
            howto: howtoData
        };
    }
    return {
        status: 500,
        body: new Error("Internal Server Error")
    };
}
