import { readOnlyClient } from '$lib/CMSUtils';

export async function load({ params }) {
  const choodle = await readOnlyClient.fetch(`*[_type == "choodle" && _id == "${params.id}"]`);
  const copy = await readOnlyClient.fetch(`*[_type == "viewChoodle"][0]`);

  if (choodle) {
    return {
      choodle: choodle[0],
      copy: copy,
    };
  }
  return {
    status: 500,
    body: new Error('Internal Server Error'),
  };
}
