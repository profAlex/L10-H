"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createIdValidator = createIdValidator;
const mongodb_1 = require("mongodb");
const http_statuses_1 = require("../../common/http-statuses/http-statuses");
const mongo_db_1 = require("../../db/mongo.db");
const collection_names_1 = require("../../db/collection-names");
function createIdValidator(paramKey, // например, "postId"
collectionName) {
    return (req, // используем стандартный Request из Express
    res, next) => __awaiter(this, void 0, void 0, function* () {
        // const sentId = req.params[paramKey]; // динамический доступ
        const sentId = typeof req.params[paramKey] === 'string' ? req.params[paramKey] : req.params[paramKey][0];
        if (yield validateId(sentId, collectionName, res)) {
            next();
        }
    });
}
// функция validateId непосредственно занимается проверкой наличия Id в соответствующей коллекции
// будет логически корректно работать только если в качестве sentId используется сформированный из ObjectId (mongoDB) уникальный идентификатор
function validateId(sentId, collectionName, res) {
    return __awaiter(this, void 0, void 0, function* () {
        // console.warn("<-------LOOK ID: ", sentId);
        if (!sentId) {
            res.status(http_statuses_1.HttpStatus.BadRequest).json({
                error: "ID parameter is required",
            });
            return false;
        }
        // console.warn("<-------LOOK ID_2: ", sentId);
        if (!mongodb_1.ObjectId.isValid(sentId)) {
            res.status(http_statuses_1.HttpStatus.BadRequest).json({
                error: `Sent ID: ${sentId} is invalid`,
            });
            return false;
        }
        let result;
        try {
            const collectionMap = {
                [collection_names_1.CollectionNames.Posts]: mongo_db_1.postsCollection,
                [collection_names_1.CollectionNames.Blogs]: mongo_db_1.bloggersCollection,
                [collection_names_1.CollectionNames.Users]: mongo_db_1.usersCollection,
                [collection_names_1.CollectionNames.Comments]: mongo_db_1.commentsCollection,
            };
            if (!(collectionName in collectionMap)) {
                res.status(http_statuses_1.HttpStatus.InternalServerError).json({
                    error: `Collection ${collectionName} is of incorrect name`,
                });
                return false;
            }
            const collectionRef = collectionMap[collectionName];
            if (!collectionRef) {
                res.status(http_statuses_1.HttpStatus.NotFound).json({
                    error: `Collection ${collectionName} not found`,
                });
                return false;
            }
            result = yield collectionRef.findOne({ _id: new mongodb_1.ObjectId(sentId) }, { projection: { _id: 1 } });
            if (!result) {
                res.status(http_statuses_1.HttpStatus.NotFound).json({
                    error: `ID ${sentId} not found`,
                });
                return false;
            }
            // console.warn("<-------ID WAS FOUND!!");
            return true;
        }
        catch (err) {
            res.status(http_statuses_1.HttpStatus.InternalServerError).json({
                error: "Internal server error during ID validation",
            });
            return false;
        }
    });
}
