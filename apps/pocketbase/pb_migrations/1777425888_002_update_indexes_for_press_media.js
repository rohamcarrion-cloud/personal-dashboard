/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("press_media");
  collection.indexes.push("CREATE INDEX idx_press_media_aiGenerated ON press_media (aiGenerated)");
  return app.save(collection);
}, (app) => {
  try {
  const collection = app.findCollectionByNameOrId("press_media");
  collection.indexes = collection.indexes.filter(idx => !idx.includes("idx_press_media_aiGenerated"));
  return app.save(collection);
  } catch (e) {
    if (e.message.includes("no rows in result set")) {
      console.log("Collection not found, skipping revert");
      return;
    }
    throw e;
  }
})