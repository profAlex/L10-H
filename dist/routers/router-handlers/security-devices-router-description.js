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
exports.SecurityDevicesHandler = void 0;
const id_names_1 = require("../util-enums/id-names");
const http_statuses_1 = require("../../common/http-statuses/http-statuses");
class SecurityDevicesHandler {
    constructor(securityDevicesCommandService) {
        this.securityDevicesCommandService = securityDevicesCommandService;
        this.removeSessionById = (req, res) => __awaiter(this, void 0, void 0, function* () {
            const result = yield this.securityDevicesCommandService.removeSessionById(req.params[id_names_1.IdParamName.DeviceId]);
            if (result === undefined) {
                res.sendStatus(http_statuses_1.HttpStatus.NotFound);
            }
            res.sendStatus(http_statuses_1.HttpStatus.NoContent);
        });
        this.removeAllButOneSession = (req, res) => __awaiter(this, void 0, void 0, function* () {
            const result = yield this.securityDevicesCommandService.removeAllButOneSession(req.sessionId, req.user.userId);
            if (result === undefined) {
                res.status(http_statuses_1.HttpStatus.InternalServerError).json({
                    error: "Internal server error during await securityDevicesCommandService.removeAllButOneSession(req.sessionId!, req.user!.userId!) inside removeAllButOneSession",
                });
            }
            res.sendStatus(http_statuses_1.HttpStatus.NoContent);
        });
        this.getDevicesList = (req, res) => __awaiter(this, void 0, void 0, function* () {
            const activeDevicesList = yield this.securityDevicesCommandService.getActiveDevicesList(req.user.userId);
            if (activeDevicesList === undefined) {
                res.status(http_statuses_1.HttpStatus.InternalServerError).json({
                    error: "Internal server error during await securityDevicesCommandService.getActiveDevicesList(req.user!.userId!) inside getDevicesList",
                });
            }
            res.status(http_statuses_1.HttpStatus.Ok).send(activeDevicesList);
        });
    }
}
exports.SecurityDevicesHandler = SecurityDevicesHandler;
