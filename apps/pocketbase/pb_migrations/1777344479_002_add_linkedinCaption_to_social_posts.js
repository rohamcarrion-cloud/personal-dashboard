/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("social_posts");

  const existing = collection.fields.getByName("linkedinCaption");
  if (existing) {
    if (existing.type === "text") {
      return; // field already exists with correct type, skip
    }
    collection.fields.removeByName("linkedinCaption"); // exists with wrong type, remove first
  }

  collection.fields.add(new TextField({
    name: "linkedinCaption",
    required: false
  }));

  return app.save(collection);
}, (app) => {
  try {
    const collection = app.findCollectionByNameOrId("social_posts");
    collection.fields.removeByName("linkedinCaption");
    return app.save(collection);
  } catch (e) {
    if (e.message.includes("no rows in result set")) {
      console.log("Collection not found, skipping revert");
      return;
    }
    throw e;
  }
})