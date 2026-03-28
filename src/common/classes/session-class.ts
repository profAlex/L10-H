import { ObjectId } from "mongodb";
import { envConfig } from "../../config";
import { UUIDgeneration } from "../../adapters/randomUUIDgeneration/UUIDgeneration";

export class UserSession {
    _id: ObjectId;
    userId: string;
    deviceId: string;
    issuedAt: Date;
    deviceName: string;
    deviceIp: string;
    expiresAt: Date;

    constructor(
        _id: ObjectId,
        userId: string,
        deviceName: string,
        deviceIp: string,
    ) {
        this._id = _id;
        this.userId = userId;
        this.deviceId = UUIDgeneration.generateUUID();

        // Получаем текущее время в мс
        const currentTimeMs = Date.now();
        // Преобразуем в секунды с округлением вниз
        const timestampSeconds = Math.floor(currentTimeMs / 1000);
        // Создаём Date из округлённых секунд (будет кратно 1000 мс)
        this.issuedAt = new Date(timestampSeconds * 1000);

        this.deviceName = deviceName;
        this.deviceIp = deviceIp;

        // Устанавливаем expiresAt на основе той же базовой временной метки
        this.expiresAt = new Date(
            this.issuedAt.getTime() + envConfig.refreshTokenLifetime * 1000,
        );
    }
}
