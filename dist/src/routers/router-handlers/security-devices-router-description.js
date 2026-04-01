"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
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
require("reflect-metadata");
const inversify_1 = require("inversify");
const id_names_1 = require("../util-enums/id-names");
const http_statuses_1 = require("../../common/http-statuses/http-statuses");
const security_devices_command_service_1 = require("../../service-layer(BLL)/security-devices-command-service");
const composition_root_1 = require("../../composition-root/composition-root");
let SecurityDevicesHandler = class SecurityDevicesHandler {
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
};
exports.SecurityDevicesHandler = SecurityDevicesHandler;
exports.SecurityDevicesHandler = SecurityDevicesHandler = __decorate([
    (0, inversify_1.injectable)(),
    __param(0, (0, inversify_1.inject)(composition_root_1.TYPES.SecurityDevicesCommandService)),
    __metadata("design:paramtypes", [security_devices_command_service_1.SecurityDevicesCommandService])
], SecurityDevicesHandler);
