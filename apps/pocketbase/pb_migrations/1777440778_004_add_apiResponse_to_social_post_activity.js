/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("social_post_activity");

  const existing = collection.fields.getByName("apiResponse");
  if (existing) {
    if (existing.type === "json") {
      return; // field already exists with correct type, skip
    }
    collection.fields.removeByName("apiResponse"); // exists with wrong type, remove first
  }

  collection.fields.add(new JSONField({
    name: "apiResponse",
    required: false
  }));

  return app.save(collection);
}, (app) => {
  try {
    const collection = app.findCollectionByNameOrId("social_post_activity");
    collection.fields.removeByName("apiResponse");
    return app.save(collection);
  } catch (e) {
    if (e.message.includes("no rows in result set")) {
      console.log("Collection not found, skipping revert");
      return;
    }
    throw e;
  }
})