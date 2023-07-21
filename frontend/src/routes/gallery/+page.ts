import {readWriteClient} from "$lib/PersistedImagesUtils";

export async function load({params}) {
    const data = await readWriteClient.fetch(`*[_type == "choodle"]`);

    if (data) {
        console.log(`load data: `, data)
        return {
            choodles: data
        };
    }
    return {
        status: 500,
        body: new Error("Internal Server Error")
    };
}
