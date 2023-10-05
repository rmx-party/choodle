import {readOnlyClient} from "$lib/CMSUtils";

export const ssr = false;

export async function load({params}) {
  const promptData = await readOnlyClient.fetch(`*[_type == "dailyPrompt"] | order(_createdAt) [0]`);
  const certificateModalData = await readOnlyClient.fetch(`*[_type == "CertificateModal"] [0]`);

  // FIXME: do both fetches asynchronously

  if (promptData || certificateModalData) {
    console.log(`load data: `, promptData, certificateModalData)
    return {
      prompt: promptData,
      certificateModal: certificateModalData,
    };
  }
  return {
    status: 500,
    body: new Error("Internal Server Error")
  };
}
