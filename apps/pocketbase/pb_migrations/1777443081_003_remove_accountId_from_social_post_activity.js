/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("social_post_activity");
  collection.fields.removeByName("accountId");
  return app.save(collection);
}, (app) => {
  try {

  const pbc_1682938177Collection = app.findCollectionByNameOrId("pbc_1682938177");
  const collection = app.findCollectionByNameOrId("social_post_activity");
  collection.fields.add(new RelationField({
    name: "accountId",
    required: false,
    collectionId: pbc_1682938177Collection.id,
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