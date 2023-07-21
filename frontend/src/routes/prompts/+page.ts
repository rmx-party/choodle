import {createClient} from '@sanity/client';
import {PUBLIC_SANITY_DATASET, PUBLIC_SANITY_PROJECT_ID} from "$env/static/public";

const client = createClient({
    projectId: PUBLIC_SANITY_PROJECT_ID,
    dataset: PUBLIC_SANITY_DATASET,
    perspective: 'published',
    apiVersion: "2023-07-18",
    useCdn: false
})

export async function load({params}) {
    const data = await client.fetch(`*[_type == "dailyPrompt"] | order(_createdAt)`);

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
