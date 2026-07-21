/// <reference path="../pb_data/types.d.ts" />

migrate((app) => {
  const collection = app.findCollectionByNameOrId("users");
  const record = new Record(collection);

  record.set("email", $os.getenv("PB_ADMIN_EMAIL"));
  record.setPassword($os.getenv("PB_ADMIN_PASSWORD"));

  try {
    return app.save(record);
  } catch (e) {
    if (e.message.includes("Value must be unique")) {
      console.log("Admin user already exists, skipping");
      return;
    }
    throw e;
  }
}, (app) => {
  try {
    const email = $os.getenv("PB_ADMIN_EMAIL");
    const record = app.findFirstRecordByData("users", "email", email);
    app.delete(record);
  } catch (e) {
    if (e.message.includes("no rows")) {
      return;
    }
    throw e;
  }
});