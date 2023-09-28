import {readOnlyClient} from "$lib/CMSUtils";

export const _query = `*[_type == "choodle"]`;

export async function load({params}) {


    const choodles = await readOnlyClient.fetch(_query);

    return {
        choodles: choodles,
    };
}
