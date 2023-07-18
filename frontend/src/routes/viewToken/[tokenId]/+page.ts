import {client} from "$lib/PersistedImagesUtils";

export async function load({params}) {
    const data = await client.fetch(`*[_type == "choodle" && _id == "${params.tokenId}"]`);

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
