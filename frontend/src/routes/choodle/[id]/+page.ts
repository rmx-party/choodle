import {readWriteClient} from "$lib/CMSUtils";

export async function load({params}) {
    const data = await readWriteClient.fetch(`*[_type == "choodle" && _id == "${params.id}"]`);

    if (data) {
        return {
            choodle: data[0]
        };
    }
    return {
        status: 500,
        body: new Error("Internal Server Error")
    };
}
