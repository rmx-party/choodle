import { readOnlyClient } from '$lib/CMSUtils';
import { loading } from '$lib/store';

export async function load({ params }) {
  loading.set(true);
  return {
    prompt: readOnlyClient.fetch(`*[_type == "dailyPrompt"] | order(_createdAt) [0]`),
    certificateModal: readOnlyClient.fetch(`*[_type == "CertificateModal"] [0]`),
  };
}
