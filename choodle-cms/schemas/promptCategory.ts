export default {
  name: "promptCategory",
  type: "document",
  title: "Category",
  fields: [
    {
      name: "label",
      type: "string",
      title: "Category",
      validation: (Rule) => Rule.required().max(25),
      description: "Max 25 characters.",
    },
    {
      name: "slug",
      type: "string",
      title: "URL Slug",
      validation: (Rule) => Rule.max(25),
      description: "Max 25 characters.",
    },
  ],
};
