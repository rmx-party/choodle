import {readOnlyClient} from "$lib/CMSUtils";
import fp from "lodash/fp";

export async function load({params}) {
    const choodles = await readOnlyClient.fetch(`*[_type == "choodle"]`);
    const nonGarbageChoodles = fp.filter((c) => {
        if (c.image?.asset._ref === undefined) {
            return false;
        } else if (c.upScaledImage?.asset._ref === undefined) {
            return false;
        }
        return true;
    })(choodles)

    if (choodles) {
        return {
            choodles: nonGarbageChoodles,
        };
    }
    return {
        status: 500,
        body: new Error("Internal Server Error")
    };
}
