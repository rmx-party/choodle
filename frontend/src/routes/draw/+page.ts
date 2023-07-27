import {readOnlyClient} from "$lib/CMSUtils";

export const ssr = false;

export async function load({params}) {
    const data = await readOnlyClient.fetch(`*[_type == "dailyPrompt"] | order(_createdAt) [0]`);

    if (data) {
        console.log(`load data: `, data)
        return {
            prompt: data
        };
    }
    return {
        status: 500,
        body: new Error("Internal Server Error")
    };
}
