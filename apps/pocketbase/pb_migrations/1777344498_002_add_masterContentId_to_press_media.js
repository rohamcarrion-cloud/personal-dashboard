/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const master_contentCollection = app.findCollectionByNameOrId("master_content");
  const collection = app.findCollectionByNameOrId("press_media");

  const existing = collection.fields.getByName("masterContentId");
  if (existing) {
    if (existing.type === "relation") {
      return; // field already exists with correct type, skip
    }
    collection.fields.removeByName("masterContentId"); // exists with wrong type, remove first
  }

  collection.fields.add(new RelationField({
    name: "masterContentId",
    required: false,
    collectionId: master_contentCollection.id,
    maxSelect: 1
  }));

  return app.save(collection);
}, (app) => {
  try {
    const collection = app.findCollectionByNameOrId("press_media");
    collection.fields.removeByName("masterContentId");
    return app.save(collection);
  } catch (e) {
    if (e.message.includes("no rows in result set")) {
      console.log("Collection not found, skipping revert");
      return;
    }
    throw e;
  }
})