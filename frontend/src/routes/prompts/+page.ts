import {readOnlyClient} from "$lib/CMSUtils";


export async function load({params}) {
    const data = await readOnlyClient.fetch(`*[_type == "dailyPrompt"] | order(_createdAt)`);

    if (data) {
        console.log(`load data: `, data)
        return {
            prompts: data
        };
    }
    return {
        status: 500,
        body: new Error("Internal Server Error")
    };
}
