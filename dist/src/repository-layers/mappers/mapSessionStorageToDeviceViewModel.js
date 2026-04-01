"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mapSessionStorageToDeviceViewModel = void 0;
const mapSessionStorageToDeviceViewModel = (sessionsData) => {
    return sessionsData.map(object => ({
        ip: object.deviceIp,
        title: object.deviceName,
        lastActiveDate: object.issuedAt.toISOString(),
        deviceId: object.deviceId,
    }));
};
exports.mapSessionStorageToDeviceViewModel = mapSessionStorageToDeviceViewModel;
