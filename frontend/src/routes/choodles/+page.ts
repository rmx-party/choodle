import {readOnlyClient} from "$lib/CMSUtils";

export async function load({params}) {
    const choodles = await readOnlyClient.fetch(`*[_type == "choodle"]`);

    return {
        choodles: choodles,
    };
}
