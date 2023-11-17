export default {
  name: "pageContent",
  type: "document",
  title: "Page Copy",
  fields: [
    {
      name: "pageSlug",
      title: "Slug",
      description:
        "The slug is used to match this content to a URL being requested in the app. It should be unique across all pages, and must match the slug used in the app code.",
      type: "string",
    },
    {
      name: "pageTitle",
      title: "HTML Title",
      description:
        "The html document title, it appears in browser tabs, opengraph cards, search results, etc.",
      type: "string",
    },
    {
      name: "pageDescription",
      title: "HTML Description",
      description:
        "The html document description text, it appears in opengraph cards, search results, etc.",
      type: "string",
    },
  ],
};
