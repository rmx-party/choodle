import { readOnlyClient } from '$lib/CMSUtils';

export const ssr = false;

export async function load({ params }) {
  const choodle = await readOnlyClient.fetch(`*[_type == "choodle" && _id == "${params.id}"]`);

  if (choodle) {
    return {
      choodle: choodle[0],
    };
  }
  return {
    status: 500,
    body: new Error('Internal Server Error'),
  };
}
