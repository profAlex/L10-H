import { ObjectId } from "mongodb";
import { dataCommandRepository } from "../repository-layers/command-repository-layer/command-repository";
import { DeviceViewModel } from "../routers/router-types/security-devices-device-view-model";
import { dataQueryRepository } from "../repository-layers/query-repository-layer/query-repository";


export const securityDevicesService = {
    async removeSessionById(deviceId: string): Promise<null | undefined> {
        return await dataCommandRepository.removeSessionByDeviceId(deviceId);
    },

    async removeAllButOneSession(sessionId: ObjectId, userId:string): Promise<null | undefined> {
        return await dataCommandRepository.removeAllButOneSession(sessionId, userId);
    },

    async getActiveDevicesList(userId:string): Promise<Array<DeviceViewModel>> {
        return await dataQueryRepository.getActiveDevicesList(userId);
    },
};