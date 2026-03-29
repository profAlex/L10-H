import { ObjectId } from "mongodb";
import { sessionsDataStorage } from "../../db/mongo.db";
import { UserSession } from "../../common/classes/session-class";

export class SessionsCommandRepository {
    // export type SessionStorageModel = {
    //     userId: string;
    //     deviceId: string;
    //     issuedAt: Date;
    //     deviceName: string;
    //     deviceIp: string;
    //     expiresAt: Date;
    // }

    // там где этот метод используется для гварда - айдишник сессии в базе передаем через req, чтобы впоследствии можно было быстро найти данную сессию
    async findSession(
        userId: string,
        deviceId: string,
        expiresAt: Date,
        issuedAt: Date,
    ): Promise<ObjectId | null> {
        try {
            const session=
                await sessionsDataStorage.findOne(
                    {
                        userId: userId,
                        deviceId: deviceId,
                        expiresAt: expiresAt,
                        issuedAt: issuedAt,
                    },
                    { projection: { _id: 1 } },
                );

            return session ? session._id : null;
        } catch (error) {
            console.error("Unknown error during findSession", error);

            return null;
        }
    }

    async createSession(sessionDto: UserSession): Promise<boolean> {
        try {
            const result = await sessionsDataStorage.insertOne(sessionDto);

            return !!result;
        } catch (error) {
            console.error("Unknown error during createSession", error);

            return false;
        }
    }

    async updateSession(
        expiresAt: Date,
        issuedAt: Date,
        sessionIndexId: ObjectId,
    ): Promise<boolean | null> {
        try {
            const result = await sessionsDataStorage.updateOne(
                { _id: sessionIndexId },
                {
                    $set: {
                        expiresAt: expiresAt,
                        issuedAt: issuedAt,
                    },
                },
            );

            if (!result.acknowledged) {
                console.error("Couldn't update session inside updateSession");

                return null;
            }

            return !!result;
        } catch (error) {
            console.error("Unknown error inside findSession", error);

            return null;
        }
    }

    async removeSessionBySessionId(sessionId: ObjectId): Promise<undefined | null> {
        try {
            const result = await sessionsDataStorage.deleteOne({
                _id: sessionId,
            });

            if (!result.acknowledged) {
                console.error("Couldn't remove session inside removeSessionBySessionId");

                return undefined;
            }

            return null;
        }catch(error) {
            console.error("Unknown error inside removeSessionBySessionId", error);

            return undefined;
        }
    }


    async removeSessionByDeviceId(deviceId: string): Promise<undefined | null> {
        try {
            const result = await sessionsDataStorage.deleteOne({
                deviceId: deviceId,
            });

            if (!result.acknowledged) {
                console.error("Couldn't remove session inside removeSessionByDeviceId");

                return undefined;
            }

            return null;
        }catch(error) {
            console.error("Unknown error inside removeSessionByDeviceId", error);

            return undefined;
        }
    }


    async removeAllButOneSession(sessionId: ObjectId, userId:string): Promise<undefined | null> {
        try {
            const result = await sessionsDataStorage.deleteMany({
                userId: userId,
                _id: { $ne: sessionId }
            });

            if (!result.acknowledged) {
                console.error("Couldn't remove sessions inside removeAllButOneSession");

                return undefined;
            }

            return null;
        }catch(error) {
            console.error("Unknown error inside removeAllButOneSession", error);

            return undefined;
        }
    }
}