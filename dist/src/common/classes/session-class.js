"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserSession = void 0;
const config_1 = require("../../config");
const UUIDgeneration_1 = require("../../adapters/randomUUIDgeneration/UUIDgeneration");
class UserSession {
    constructor(_id, userId, deviceName, deviceIp) {
        this._id = _id;
        this.userId = userId;
        this.deviceId = UUIDgeneration_1.UUIDgeneration.generateUUID();
        // Получаем текущее время в мс
        const currentTimeMs = Date.now();
        // Преобразуем в секунды с округлением вниз
        const timestampSeconds = Math.floor(currentTimeMs / 1000);
        // Создаём Date из округлённых секунд (будет кратно 1000 мс)
        this.issuedAt = new Date(timestampSeconds * 1000);
        this.deviceName = deviceName;
        this.deviceIp = deviceIp;
        // Устанавливаем expiresAt на основе той же базовой временной метки
        this.expiresAt = new Date(this.issuedAt.getTime() + config_1.envConfig.refreshTokenLifetime * 1000);
    }
}
exports.UserSession = UserSession;
