/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("platform_settings");

  const existing = collection.fields.getByName("supportEmail");
  if (existing) {
    if (existing.type === "email") {
      return; // field already exists with correct type, skip
    }
    collection.fields.removeByName("supportEmail"); // exists with wrong type, remove first
  }

  collection.fields.add(new EmailField({
    name: "supportEmail"
  }));

  return app.save(collection);
}, (app) => {
  try {
    const collection = app.findCollectionByNameOrId("platform_settings");
    collection.fields.removeByName("supportEmail");
    return app.save(collection);
  } catch (e) {
    if (e.message.includes("no rows in result set")) {
      console.log("Collection not found, skipping revert");
      return;
    }
    throw e;
  }
})