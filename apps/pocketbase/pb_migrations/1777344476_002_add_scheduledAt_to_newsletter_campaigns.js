/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("newsletter_campaigns");

  const existing = collection.fields.getByName("scheduledAt");
  if (existing) {
    if (existing.type === "date") {
      return; // field already exists with correct type, skip
    }
    collection.fields.removeByName("scheduledAt"); // exists with wrong type, remove first
  }

  collection.fields.add(new DateField({
    name: "scheduledAt",
    required: false
  }));

  return app.save(collection);
}, (app) => {
  try {
    const collection = app.findCollectionByNameOrId("newsletter_campaigns");
    collection.fields.removeByName("scheduledAt");
    return app.save(collection);
  } catch (e) {
    if (e.message.includes("no rows in result set")) {
      console.log("Collection not found, skipping revert");
      return;
    }
    throw e;
  }
})