/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("ai_usage");
  collection.indexes.push("CREATE INDEX idx_ai_usage_userId ON ai_usage (userId)");
  collection.indexes.push("CREATE INDEX idx_ai_usage_provider ON ai_usage (provider)");
  collection.indexes.push("CREATE INDEX idx_ai_usage_contentType ON ai_usage (contentType)");
  collection.indexes.push("CREATE INDEX idx_ai_usage_createdAt ON ai_usage (created)");
  return app.save(collection);
}, (app) => {
  try {
  const collection = app.findCollectionByNameOrId("ai_usage");
  collection.indexes = collection.indexes.filter(idx => !idx.includes("idx_ai_usage_userId"));
  collection.indexes = collection.indexes.filter(idx => !idx.includes("idx_ai_usage_provider"));
  collection.indexes = collection.indexes.filter(idx => !idx.includes("idx_ai_usage_contentType"));
  collection.indexes = collection.indexes.filter(idx => !idx.includes("idx_ai_usage_createdAt"));
  return app.save(collection);
  } catch (e) {
    if (e.message.includes("no rows in result set")) {
      console.log("Collection not found, skipping revert");
      return;
    }
    throw e;
  }
})