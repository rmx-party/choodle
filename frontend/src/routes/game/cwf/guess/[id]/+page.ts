import {readOnlyClient} from "$lib/CMSUtils";

export const ssr = false;

export async function load({params}) {
    const choodle = await readOnlyClient.fetch(`*[_type == "choodle" && _id == "${params.id}"] [0]`);

    if (choodle) return {choodle};

    return {
        status: 500,
        body: new Error("Internal Server Error")
    };
}
