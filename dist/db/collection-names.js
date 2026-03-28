"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CollectionNames = void 0;
const mongo_db_1 = require("./mongo.db");
var CollectionNames;
(function (CollectionNames) {
    CollectionNames["Posts"] = "posts_collection";
    CollectionNames["Blogs"] = "bloggers_collection";
    CollectionNames["Users"] = "users_collection";
    CollectionNames["Comments"] = "comments_collection";
})(CollectionNames || (exports.CollectionNames = CollectionNames = {}));
