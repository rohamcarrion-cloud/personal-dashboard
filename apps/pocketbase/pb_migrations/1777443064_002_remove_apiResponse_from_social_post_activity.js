/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("social_post_activity");
  collection.fields.removeByName("apiResponse");
  return app.save(collection);
}, (app) => {
  try {

  const collection = app.findCollectionByNameOrId("social_post_activity");
  collection.fields.add(new JSONField({
    name: "apiResponse",
    required: false
  }));
  return app.save(collection);
  } catch (e) {
    if (e.message.includes("no rows in result set")) {
      console.log("Collection not found, skipping revert");
      return;
    }
    throw e;
  }
})