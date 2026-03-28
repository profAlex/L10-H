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
exports.validateDeviceId = void 0;
const id_names_1 = require("../util-enums/id-names");
const http_statuses_1 = require("../../common/http-statuses/http-statuses");
const mongo_db_1 = require("../../db/mongo.db");
const validateDeviceId = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const sentDeviceId = req.params[id_names_1.IdParamName.DeviceId];
    // такого нет в swagger, этого случая не описано
    if (!sentDeviceId) {
        return res.status(http_statuses_1.HttpStatus.BadRequest).json({
            error: "deviceId parameter is required",
        });
    }
    try {
        const result = yield mongo_db_1.sessionsDataStorage.findOne({
            deviceId: sentDeviceId,
        });
        if (!result) {
            return res.status(http_statuses_1.HttpStatus.NotFound).json({
                error: `deviceId ${sentDeviceId} not found`,
            });
        }
        else if (result.userId !== req.user.userId) {
            // но при этом мы можем удалить другие deviceId принадлежащие этому же юзеру
            return res.status(http_statuses_1.HttpStatus.Forbidden).json({
                error: "Attempting to delete the deviceId of other user",
            });
        }
    }
    catch (err) {
        return res.status(http_statuses_1.HttpStatus.InternalServerError).json({
            error: "Internal server error during deviceId validation inside validateDeviceId",
        });
    }
    // а вот эта проверка ни о чем не говорит, мы можем с другого девайся удалить любой другой девайс того же юзера
    // if (sentDeviceId !== req.deviceId) {
    //     res.status(HttpStatus.NotFound).json({
    //         error: `deviceId sent in parameters - ${sentDeviceId} - is not found`,
    //     });
    // }
    next();
});
exports.validateDeviceId = validateDeviceId;
