import { SessionStorageModel } from "../../routers/router-types/auth-SessionStorageModel";
import { WithId } from "mongodb";
import { DeviceViewModel } from "../../routers/router-types/security-devices-device-view-model";

export const mapSessionStorageToDeviceViewModel = (
    sessionsData: WithId<SessionStorageModel>[],
): DeviceViewModel[] => {
    return sessionsData.map(object => ({
        ip: object.deviceIp,
        title: object.deviceName,
        lastActiveDate: object.issuedAt.toISOString(),
        deviceId: object.deviceId,
    }));
};
