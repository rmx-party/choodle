import {readOnlyClient} from "$lib/CMSUtils";

export async function load({params}) {
    const data = await readOnlyClient.fetch(`*[_type == "howto"] | order(_createdAt) [0]`);

        console.log(`load data: `, data)
        return {
            howto: data || {howto: { howto: []}}
        };
}
