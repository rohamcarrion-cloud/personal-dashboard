/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("social_post_activity");
  collection.fields.removeByName("jobId");
  return app.save(collection);
}, (app) => {
  try {

  const pbc_2189175516Collection = app.findCollectionByNameOrId("pbc_2189175516");
  const collection = app.findCollectionByNameOrId("social_post_activity");
  collection.fields.add(new RelationField({
    name: "jobId",
    required: false,
    collectionId: pbc_2189175516Collection.id,
    maxSelect: 0,
    cascadeDelete: false
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