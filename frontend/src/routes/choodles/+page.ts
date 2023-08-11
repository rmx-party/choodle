import {readOnlyClient} from "$lib/CMSUtils";
import fp from "lodash/fp";

export async function load({params}) {
    const choodles = await readOnlyClient.fetch(`*[_type == "choodle"]`);

    if (choodles) {
        return {
            choodles: choodles,
        };
    }
    return {
        status: 500,
        body: new Error("Internal Server Error")
    };
}
