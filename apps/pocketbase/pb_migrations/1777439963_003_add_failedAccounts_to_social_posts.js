/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("social_posts");

  const existing = collection.fields.getByName("failedAccounts");
  if (existing) {
    if (existing.type === "json") {
      return; // field already exists with correct type, skip
    }
    collection.fields.removeByName("failedAccounts"); // exists with wrong type, remove first
  }

  collection.fields.add(new JSONField({
    name: "failedAccounts",
    required: false
  }));

  return app.save(collection);
}, (app) => {
  try {
    const collection = app.findCollectionByNameOrId("social_posts");
    collection.fields.removeByName("failedAccounts");
    return app.save(collection);
  } catch (e) {
    if (e.message.includes("no rows in result set")) {
      console.log("Collection not found, skipping revert");
      return;
    }
    throw e;
  }
})