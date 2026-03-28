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
exports.getDevicesList = exports.removeAllButOneSession = exports.removeSessionById = void 0;
const id_names_1 = require("../util-enums/id-names");
const http_statuses_1 = require("../../common/http-statuses/http-statuses");
const security_devices_service_1 = require("../../service-layer(BLL)/security-devices-service");
const removeSessionById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield security_devices_service_1.securityDevicesService.removeSessionById(req.params[id_names_1.IdParamName.DeviceId]);
    if (result === undefined) {
        res.sendStatus(http_statuses_1.HttpStatus.NotFound);
    }
    res.sendStatus(http_statuses_1.HttpStatus.NoContent);
});
exports.removeSessionById = removeSessionById;
const removeAllButOneSession = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield security_devices_service_1.securityDevicesService.removeAllButOneSession(req.sessionId, req.user.userId);
    if (result === undefined) {
        res.status(http_statuses_1.HttpStatus.InternalServerError).json({
            error: "Internal server error during await securityDevicesService.removeAllButOneSession(req.sessionId!, req.user!.userId!) inside removeAllButOneSession",
        });
    }
    res.sendStatus(http_statuses_1.HttpStatus.NoContent);
});
exports.removeAllButOneSession = removeAllButOneSession;
const getDevicesList = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const activeDevicesList = yield security_devices_service_1.securityDevicesService.getActiveDevicesList(req.user.userId);
    if (activeDevicesList === undefined) {
        res.status(http_statuses_1.HttpStatus.InternalServerError).json({
            error: "Internal server error during await securityDevicesService.getActiveDevicesList(req.user!.userId!) inside getDevicesList",
        });
    }
    res.status(http_statuses_1.HttpStatus.Ok).send(activeDevicesList);
});
exports.getDevicesList = getDevicesList;
