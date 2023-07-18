import {createClient} from '@sanity/client';

const client = createClient({
    projectId: "6yqmsxl6",
    dataset: "production",
    apiVersion: "2023-07-18",
    useCdn: false
})

export async function load({ params }) {
  const data = await client.fetch(`*[_type == "dailyPrompt"]`);

  if (data) {
    return {
      prompts: data
    };
  }
  return {
    status: 500,
    body: new Error("Internal Server Error")
  };
}
