/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const campaignsCollection = app.findCollectionByNameOrId("campaigns");
  const collection = app.findCollectionByNameOrId("blog_posts");

  const existing = collection.fields.getByName("campaignId");
  if (existing) {
    if (existing.type === "relation") {
      return; // field already exists with correct type, skip
    }
    collection.fields.removeByName("campaignId"); // exists with wrong type, remove first
  }

  collection.fields.add(new RelationField({
    name: "campaignId",
    required: false,
    collectionId: campaignsCollection.id,
    maxSelect: 1
  }));

  return app.save(collection);
}, (app) => {
  try {
    const collection = app.findCollectionByNameOrId("blog_posts");
    collection.fields.removeByName("campaignId");
    return app.save(collection);
  } catch (e) {
    if (e.message.includes("no rows in result set")) {
      console.log("Collection not found, skipping revert");
      return;
    }
    throw e;
  }
})