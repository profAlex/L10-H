"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
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
exports.SessionsCommandRepository = void 0;
require("reflect-metadata");
const inversify_1 = require("inversify");
const mongo_db_1 = require("../../db/mongo.db");
let SessionsCommandRepository = class SessionsCommandRepository {
    // export type SessionStorageModel = {
    //     userId: string;
    //     deviceId: string;
    //     issuedAt: Date;
    //     deviceName: string;
    //     deviceIp: string;
    //     expiresAt: Date;
    // }
    // там где этот метод используется для гварда - айдишник сессии в базе передаем через req, чтобы впоследствии можно было быстро найти данную сессию
    findSession(userId, deviceId, expiresAt, issuedAt) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const session = yield mongo_db_1.sessionsDataStorage.findOne({
                    userId: userId,
                    deviceId: deviceId,
                    expiresAt: expiresAt,
                    issuedAt: issuedAt,
                }, { projection: { _id: 1 } });
                return session ? session._id : null;
            }
            catch (error) {
                console.error("Unknown error during findSession", error);
                return null;
            }
        });
    }
    createSession(sessionDto) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const result = yield mongo_db_1.sessionsDataStorage.insertOne(sessionDto);
                return !!result;
            }
            catch (error) {
                console.error("Unknown error during createSession", error);
                return false;
            }
        });
    }
    updateSession(expiresAt, issuedAt, sessionIndexId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const result = yield mongo_db_1.sessionsDataStorage.updateOne({ _id: sessionIndexId }, {
                    $set: {
                        expiresAt: expiresAt,
                        issuedAt: issuedAt,
                    },
                });
                if (!result.acknowledged) {
                    console.error("Couldn't update session inside updateSession");
                    return null;
                }
                return !!result;
            }
            catch (error) {
                console.error("Unknown error inside findSession", error);
                return null;
            }
        });
    }
    removeSessionBySessionId(sessionId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const result = yield mongo_db_1.sessionsDataStorage.deleteOne({
                    _id: sessionId,
                });
                if (!result.acknowledged) {
                    console.error("Couldn't remove session inside removeSessionBySessionId");
                    return undefined;
                }
                return null;
            }
            catch (error) {
                console.error("Unknown error inside removeSessionBySessionId", error);
                return undefined;
            }
        });
    }
    removeSessionByDeviceId(deviceId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const result = yield mongo_db_1.sessionsDataStorage.deleteOne({
                    deviceId: deviceId,
                });
                if (!result.acknowledged) {
                    console.error("Couldn't remove session inside removeSessionByDeviceId");
                    return undefined;
                }
                return null;
            }
            catch (error) {
                console.error("Unknown error inside removeSessionByDeviceId", error);
                return undefined;
            }
        });
    }
    removeAllButOneSession(sessionId, userId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const result = yield mongo_db_1.sessionsDataStorage.deleteMany({
                    userId: userId,
                    _id: { $ne: sessionId }
                });
                if (!result.acknowledged) {
                    console.error("Couldn't remove sessions inside removeAllButOneSession");
                    return undefined;
                }
                return null;
            }
            catch (error) {
                console.error("Unknown error inside removeAllButOneSession", error);
                return undefined;
            }
        });
    }
};
exports.SessionsCommandRepository = SessionsCommandRepository;
exports.SessionsCommandRepository = SessionsCommandRepository = __decorate([
    (0, inversify_1.injectable)()
], SessionsCommandRepository);
