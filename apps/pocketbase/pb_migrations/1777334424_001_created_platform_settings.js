/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = new Collection({
    "createRule": "@request.auth.id != ''",
    "deleteRule": "@request.auth.id != ''",
    "fields":     [
          {
                "autogeneratePattern": "[a-z0-9]{15}",
                "hidden": false,
                "id": "text8093185374",
                "max": 15,
                "min": 15,
                "name": "id",
                "pattern": "^[a-z0-9]+$",
                "presentable": false,
                "primaryKey": true,
                "required": true,
                "system": true,
                "type": "text"
          },
          {
                "hidden": false,
                "id": "text6755054070",
                "name": "siteName",
                "presentable": false,
                "primaryKey": false,
                "required": false,
                "system": false,
                "type": "text",
                "autogeneratePattern": "",
                "max": 0,
                "min": 0,
                "pattern": ""
          },
          {
                "hidden": false,
                "id": "text1225609562",
                "name": "brandStatement",
                "presentable": false,
                "primaryKey": false,
                "required": false,
                "system": false,
                "type": "text",
                "autogeneratePattern": "",
                "max": 0,
                "min": 0,
                "pattern": ""
          },
          {
                "hidden": false,
                "id": "email7237308617",
                "name": "contactEmail",
                "presentable": false,
                "primaryKey": false,
                "required": false,
                "system": false,
                "type": "email",
                "exceptDomains": [],
                "onlyDomains": []
          },
          {
                "hidden": false,
                "id": "text5676448720",
                "name": "phoneNumber",
                "presentable": false,
                "primaryKey": false,
                "required": false,
                "system": false,
                "type": "text",
                "autogeneratePattern": "",
                "max": 0,
                "min": 0,
                "pattern": ""
          },
          {
                "hidden": false,
                "id": "text7558785550",
                "name": "socialLinks",
                "presentable": false,
                "primaryKey": false,
                "required": false,
                "system": false,
                "type": "text",
                "autogeneratePattern": "",
                "max": 0,
                "min": 0,
                "pattern": ""
          },
          {
                "hidden": false,
                "id": "bool2898974456",
                "name": "newsletterSignupEnabled",
                "presentable": false,
                "primaryKey": false,
                "required": false,
                "system": false,
                "type": "bool"
          },
          {
                "hidden": false,
                "id": "bool0182993785",
                "name": "publicBlogEnabled",
                "presentable": false,
                "primaryKey": false,
                "required": false,
                "system": false,
                "type": "bool"
          },
          {
                "hidden": false,
                "id": "bool2703992228",
                "name": "publicProjectsEnabled",
                "presentable": false,
                "primaryKey": false,
                "required": false,
                "system": false,
                "type": "bool"
          },
          {
                "hidden": false,
                "id": "autodate9373694786",
                "name": "createdAt",
                "presentable": false,
                "primaryKey": false,
                "required": false,
                "system": false,
                "type": "autodate",
                "onCreate": true,
                "onUpdate": false
          },
          {
                "hidden": false,
                "id": "autodate6272835754",
                "name": "updatedAt",
                "presentable": false,
                "primaryKey": false,
                "required": false,
                "system": false,
                "type": "autodate",
                "onCreate": true,
                "onUpdate": true
          },
          {
                "hidden": false,
                "id": "autodate6484875391",
                "name": "created",
                "onCreate": true,
                "onUpdate": false,
                "presentable": false,
                "system": false,
                "type": "autodate"
          },
          {
                "hidden": false,
                "id": "autodate6448355712",
                "name": "updated",
                "onCreate": true,
                "onUpdate": true,
                "presentable": false,
                "system": false,
                "type": "autodate"
          }
    ],
    "id": "pbc_4094895955",
    "indexes": [],
    "listRule": "",
    "name": "platform_settings",
    "system": false,
    "type": "base",
    "updateRule": "@request.auth.id != ''",
    "viewRule": ""
  });

  try {
    return app.save(collection);
  } catch (e) {
    if (e.message.includes("Collection name must be unique")) {
      console.log("Collection already exists, skipping");
      return;
    }
    throw e;
  }
}, (app) => {
  try {
    const collection = app.findCollectionByNameOrId("pbc_4094895955");
    return app.delete(collection);
  } catch (e) {
    if (e.message.includes("no rows in result set")) {
      console.log("Collection not found, skipping revert");
      return;
    }
    throw e;
  }
})