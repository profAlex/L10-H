import { ObjectId } from "mongodb";
import { dataCommandRepository } from "../repository-layers/command-repository-layer/command-repository";
import { DeviceViewModel } from "../routers/router-types/security-devices-device-view-model";
import { dataQueryRepository } from "../repository-layers/query-repository-layer/query-repository";
import { SessionsCommandRepository } from "../repository-layers/command-repository-layer/sessions-command-repository";


export class SecurityDevicesCommandService {

    constructor(protected sessionsCommandRepository: SessionsCommandRepository) {};

    async removeSessionById(deviceId: string): Promise<null | undefined> {
        return await this.sessionsCommandRepository.removeSessionByDeviceId(deviceId);
    }

    async removeAllButOneSession(sessionId: ObjectId, userId:string): Promise<null | undefined> {
        return await this.sessionsCommandRepository.removeAllButOneSession(sessionId, userId);
    }

    async getActiveDevicesList(userId:string): Promise<Array<DeviceViewModel>> {
        return await dataQueryRepository.getActiveDevicesList(userId);
    }
};