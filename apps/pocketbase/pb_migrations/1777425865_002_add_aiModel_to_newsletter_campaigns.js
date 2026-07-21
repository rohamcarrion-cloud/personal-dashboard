/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("newsletter_campaigns");

  const existing = collection.fields.getByName("aiModel");
  if (existing) {
    if (existing.type === "text") {
      return; // field already exists with correct type, skip
    }
    collection.fields.removeByName("aiModel"); // exists with wrong type, remove first
  }

  collection.fields.add(new TextField({
    name: "aiModel",
    required: false
  }));

  return app.save(collection);
}, (app) => {
  try {
    const collection = app.findCollectionByNameOrId("newsletter_campaigns");
    collection.fields.removeByName("aiModel");
    return app.save(collection);
  } catch (e) {
    if (e.message.includes("no rows in result set")) {
      console.log("Collection not found, skipping revert");
      return;
    }
    throw e;
  }
})