/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const media_libraryCollection = app.findCollectionByNameOrId("media_library");
  const collection = app.findCollectionByNameOrId("master_content");

  const existing = collection.fields.getByName("linkedAssets");
  if (existing) {
    if (existing.type === "relation") {
      return; // field already exists with correct type, skip
    }
    collection.fields.removeByName("linkedAssets"); // exists with wrong type, remove first
  }

  collection.fields.add(new RelationField({
    name: "linkedAssets",
    collectionId: media_libraryCollection.id,
    maxSelect: 999
  }));

  return app.save(collection);
}, (app) => {
  try {
    const collection = app.findCollectionByNameOrId("master_content");
    collection.fields.removeByName("linkedAssets");
    return app.save(collection);
  } catch (e) {
    if (e.message.includes("no rows in result set")) {
      console.log("Collection not found, skipping revert");
      return;
    }
    throw e;
  }
})