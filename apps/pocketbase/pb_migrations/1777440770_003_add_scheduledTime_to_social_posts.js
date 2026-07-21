/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("social_posts");

  const existing = collection.fields.getByName("scheduledTime");
  if (existing) {
    if (existing.type === "date") {
      return; // field already exists with correct type, skip
    }
    collection.fields.removeByName("scheduledTime"); // exists with wrong type, remove first
  }

  collection.fields.add(new DateField({
    name: "scheduledTime",
    required: false
  }));

  return app.save(collection);
}, (app) => {
  try {
    const collection = app.findCollectionByNameOrId("social_posts");
    collection.fields.removeByName("scheduledTime");
    return app.save(collection);
  } catch (e) {
    if (e.message.includes("no rows in result set")) {
      console.log("Collection not found, skipping revert");
      return;
    }
    throw e;
  }
})