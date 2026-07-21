/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const social_accountsCollection = app.findCollectionByNameOrId("social_accounts");
  const collection = app.findCollectionByNameOrId("social_post_activity");

  const existing = collection.fields.getByName("accountId");
  if (existing) {
    if (existing.type === "relation") {
      return; // field already exists with correct type, skip
    }
    collection.fields.removeByName("accountId"); // exists with wrong type, remove first
  }

  collection.fields.add(new RelationField({
    name: "accountId",
    required: false,
    collectionId: social_accountsCollection.id
  }));

  return app.save(collection);
}, (app) => {
  try {
    const collection = app.findCollectionByNameOrId("social_post_activity");
    collection.fields.removeByName("accountId");
    return app.save(collection);
  } catch (e) {
    if (e.message.includes("no rows in result set")) {
      console.log("Collection not found, skipping revert");
      return;
    }
    throw e;
  }
})