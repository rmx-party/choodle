import {readOnlyClient} from "$lib/CMSUtils";

export async function load({params}) {
    const choodles = await readOnlyClient.fetch(`*[_type == "choodle"]`);
    const nonGarbageChoodles = choodles.filter(choodle => {
        if (choodle.image?.asset._ref === undefined) {
            return false;
        } else if (choodle.upScaledImage?.asset._ref === undefined) {
            return false;
        }
        return true;
    });

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
