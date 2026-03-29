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
exports.SecurityDevicesCommandService = void 0;
const query_repository_1 = require("../repository-layers/query-repository-layer/query-repository");
class SecurityDevicesCommandService {
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
}
exports.SecurityDevicesCommandService = SecurityDevicesCommandService;
;
