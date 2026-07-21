/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const publishing_jobsCollection = app.findCollectionByNameOrId("publishing_jobs");
  const collection = app.findCollectionByNameOrId("social_post_activity");

  const existing = collection.fields.getByName("jobId");
  if (existing) {
    if (existing.type === "relation") {
      return; // field already exists with correct type, skip
    }
    collection.fields.removeByName("jobId"); // exists with wrong type, remove first
  }

  collection.fields.add(new RelationField({
    name: "jobId",
    required: false,
    collectionId: publishing_jobsCollection.id
  }));

  return app.save(collection);
}, (app) => {
  try {
    const collection = app.findCollectionByNameOrId("social_post_activity");
    collection.fields.removeByName("jobId");
    return app.save(collection);
  } catch (e) {
    if (e.message.includes("no rows in result set")) {
      console.log("Collection not found, skipping revert");
      return;
    }
    throw e;
  }
})