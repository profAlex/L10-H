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
exports.SecurityDevicesCommandService = void 0;
require("reflect-metadata");
const inversify_1 = require("inversify");
const query_repository_1 = require("../repository-layers/query-repository-layer/query-repository");
const sessions_command_repository_1 = require("../repository-layers/command-repository-layer/sessions-command-repository");
const composition_root_1 = require("../composition-root/composition-root");
let SecurityDevicesCommandService = class SecurityDevicesCommandService {
    constructor(sessionsCommandRepository) {
        this.sessionsCommandRepository = sessionsCommandRepository;
    }
    ;
    removeSessionById(deviceId) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.sessionsCommandRepository.removeSessionByDeviceId(deviceId);
        });
    }
    removeAllButOneSession(sessionId, userId) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.sessionsCommandRepository.removeAllButOneSession(sessionId, userId);
        });
    }
    getActiveDevicesList(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield query_repository_1.dataQueryRepository.getActiveDevicesList(userId);
        });
    }
};
exports.SecurityDevicesCommandService = SecurityDevicesCommandService;
exports.SecurityDevicesCommandService = SecurityDevicesCommandService = __decorate([
    (0, inversify_1.injectable)(),
    __param(0, (0, inversify_1.inject)(composition_root_1.TYPES.SessionsCommandRepository)),
    __metadata("design:paramtypes", [sessions_command_repository_1.SessionsCommandRepository])
], SecurityDevicesCommandService);
;
