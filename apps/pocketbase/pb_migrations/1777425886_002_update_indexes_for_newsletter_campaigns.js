/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("newsletter_campaigns");
  collection.indexes.push("CREATE INDEX idx_newsletter_campaigns_aiGenerated ON newsletter_campaigns (aiGenerated)");
  return app.save(collection);
}, (app) => {
  try {
  const collection = app.findCollectionByNameOrId("newsletter_campaigns");
  collection.indexes = collection.indexes.filter(idx => !idx.includes("idx_newsletter_campaigns_aiGenerated"));
  return app.save(collection);
  } catch (e) {
    if (e.message.includes("no rows in result set")) {
      console.log("Collection not found, skipping revert");
      return;
    }
    throw e;
  }
})