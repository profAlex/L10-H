import express from "express";
import request from "supertest";
import {
    AUTH_PATH,
    SECURITY_DEVICES_PATH,
    TESTING_PATH,
} from "../src/routers/pathes/router-pathes";
import { setupApp } from "../src/setup-app";
import { closeDB, runDB } from "../src/db/mongo.db";
import { UserInputModel } from "../src/routers/router-types/user-input-model";
import { dataCommandRepository } from "../src/repository-layers/command-repository-layer/command-repository";
import { dataQueryRepository } from "../src/repository-layers/query-repository-layer/query-repository";
import { HttpStatus } from "../src/common/http-statuses/http-statuses";
import { jwtService } from "../src/adapters/verification/jwt-service";
import { JwtRefreshPayloadType } from "../src/adapters/verification/payload-type";
import { RegistrationUserInputModel } from "../src/routers/router-types/auth-registration-input-model";
import { UsersQueryRepository } from "../src/repository-layers/query-repository-layer/users-query-repository";

describe("Test API for managing session life-time and updated refresh-token renewal system", () => {
    const testApp = express();
    setupApp(testApp);

    beforeAll(async () => {
        await runDB();

        const res = await request(testApp).delete(`${TESTING_PATH}/all-data`);
        expect(res.status).toBe(204);
    });

    afterAll(async () => {
        const res = await request(testApp).delete(`${TESTING_PATH}/all-data`);
        expect(res.status).toBe(204);
        // Закрываем после всех тестов
        await closeDB();
    });

    let userId_1: string | undefined = "";
    let userId_2: string | undefined = "";
    let userId_3: string | undefined = "";
    let userId_4: string | undefined = "";

    let refreshTokenValue1: string | undefined = "";
    let newRefreshTokenValue1: string | undefined = "";

    let refreshTokenValue2: string | undefined = "";
    let refreshTokenValue3: string | undefined = "";
    let refreshTokenValue4: string | undefined = "";

    let refreshToken1DecodedData: JwtRefreshPayloadType | null = null;
    // let loginCreds_1 = {};
    // let loginCreds_2 = {};

    // beforeEach(() => {
    //     // мокаем возвращаемое значение для некоторых тестируемых здесь функций, относящихся в первую очередь к работе с почтовым сервисом
    //     // это нужно делать в блоке beforeEach, иначе шпион будет накапливать статистику вызовов
    //     // глобально внутри всего describe, и это будет сбивать логику проверок
    //     jest.spyOn(
    //         mailerService,
    //         "sendConfirmationRegisterEmail",
    //     ).mockResolvedValue(true);
    //
    //     jest.spyOn(UUIDgeneration, "generateUUID").mockReturnValue(
    //         "1-2-3-4-5-6",
    //     );
    // });
    //
    // afterEach(() => {
    //     jest.clearAllMocks(); // сбрасываем статистику вызовов, иначе она будет накапливать счет вызовов
    //     // или jest.restoreAllMocks()
    // });

    it("Creating test user entries, directly without endpoint calls", async () => {
        const newUser_1: UserInputModel = {
            login: "hello_wr",
            password: "hello_world",
            email: "test_email@yandex.com",
        };
        userId_1 = await dataCommandRepository.createNewUser(newUser_1);

        const newUser_2: UserInputModel = {
            login: "hello_w2",
            password: "hello_world",
            email: "test_email_2@yandex.com",
        };
        userId_2 = await dataCommandRepository.createNewUser(newUser_2);

        const newUser_3: UserInputModel = {
            login: "hello_world_3",
            password: "hello_world",
            email: "test_email_3@yandex.com",
        };
        userId_3 = await dataCommandRepository.createNewUser(newUser_3);

        const newUser_4: UserInputModel = {
            login: "hello_world_4",
            password: "hello_world",
            email: "test_email_4@yandex.com",
        };
        userId_4 = await dataCommandRepository.createNewUser(newUser_4);

        // loginCreds_1 = {
        //     loginOrEmail: "hello_wrld1",
        //     password: "hello_world",
        // };
        //
        // loginCreds_2 = {
        //     loginOrEmail: "wrong_log",
        //     password: "hello_world",
        // };
    });

    it("GET '/api/security/devices' - should return proper amount of active sessions(devices) equal tp 4", async () => {
        expect(await UsersQueryRepository.returnUsersAmount()).toBe(4);

        const loginCreds_1 = {
            loginOrEmail: "hello_wr",
            password: "hello_world",
        };

        const res1 = await request(testApp)
            .post(`${AUTH_PATH}/login`)
            .set("User-Agent", "CustomUserAgentHeader/1.0")
            .send(loginCreds_1);

        expect(res1.status).toBe(HttpStatus.Ok);
        const entriesCount1 = Object.entries(res1.body).length;
        expect(entriesCount1).toBe(1);
        expect(res1.body).toHaveProperty("accessToken");

        //******* В этом блоке выдираем рефреш-куку,
        // возвращенную при логине для использование в последующих тест-блоках
        {
            expect(res1.header["set-cookie"]).toBeDefined();

            // Извлекаем refresh token из кук
            const setCookieValue = res1.header["set-cookie"];
            let refreshTokenCookie: string | undefined;

            if (Array.isArray(setCookieValue)) {
                refreshTokenCookie = setCookieValue.find((cookie) =>
                    cookie.startsWith("refreshToken="),
                );
            } else if (typeof setCookieValue === "string") {
                refreshTokenCookie = setCookieValue.startsWith("refreshToken=")
                    ? setCookieValue
                    : undefined;
            }

            expect(refreshTokenCookie).toBeDefined();

            // вспомогательная функция
            const extractJwtFromCookie = (cookieString: string): string => {
                const parts = cookieString.split("=");
                if (parts.length < 2) {
                    throw new Error('Invalid cookie format: no "=" found');
                }
                const jwtWithAttributes = parts[1];
                const jwt = jwtWithAttributes.split(";")[0];
                return jwt;
            };

            if (!refreshTokenCookie) {
                throw new Error("Refresh cookie is undefined");
            }

            refreshTokenValue1 = extractJwtFromCookie(refreshTokenCookie);
            expect(refreshTokenValue1).toMatch(
                /^[a-zA-Z0-9\-_]+\.[a-zA-Z0-9\-_]+\.[a-zA-Z0-9\-_]+$/,
            );
        }

        // ********

        const res2 = await request(testApp)
            .post(`${AUTH_PATH}/login`)
            .set("User-Agent", "CustomUserAgentHeader/2.0")
            .send(loginCreds_1);

        expect(res2.status).toBe(HttpStatus.Ok);
        const entriesCount2 = Object.entries(res2.body).length;
        expect(entriesCount2).toBe(1);
        expect(res2.body).toHaveProperty("accessToken");

        //******* В этом блоке выдираем рефреш-куку,
        // возвращенную при логине для использование в последующих тест-блоках
        expect(res2.header["set-cookie"]).toBeDefined();

        // Извлекаем refresh token из кук
        {
            const setCookieValue = res2.header["set-cookie"];
            let refreshTokenCookie: string | undefined;

            if (Array.isArray(setCookieValue)) {
                refreshTokenCookie = setCookieValue.find((cookie) =>
                    cookie.startsWith("refreshToken="),
                );
            } else if (typeof setCookieValue === "string") {
                refreshTokenCookie = setCookieValue.startsWith("refreshToken=")
                    ? setCookieValue
                    : undefined;
            }

            expect(refreshTokenCookie).toBeDefined();

            // вспомогательная функция
            const extractJwtFromCookie = (cookieString: string): string => {
                const parts = cookieString.split("=");
                if (parts.length < 2) {
                    throw new Error('Invalid cookie format: no "=" found');
                }
                const jwtWithAttributes = parts[1];
                const jwt = jwtWithAttributes.split(";")[0];
                return jwt;
            };

            if (!refreshTokenCookie) {
                throw new Error("Refresh cookie is undefined");
            }

            refreshTokenValue2 = extractJwtFromCookie(refreshTokenCookie);
            expect(refreshTokenValue1).toMatch(
                /^[a-zA-Z0-9\-_]+\.[a-zA-Z0-9\-_]+\.[a-zA-Z0-9\-_]+$/,
            );
        }

        // ********

        //изобретаем задержку на 1 секунду
        const delay = (ms: number) =>
            new Promise((resolve) => setTimeout(resolve, ms));
        await delay(1000); // задержка 1 секунда

        const res3 = await request(testApp)
            .post(`${AUTH_PATH}/login`)
            .set("User-Agent", "CustomUserAgentHeader/3.0")
            .send(loginCreds_1);

        expect(res3.status).toBe(HttpStatus.Ok);
        const entriesCount3 = Object.entries(res3.body).length;
        expect(entriesCount3).toBe(1);
        expect(res3.body).toHaveProperty("accessToken");

        //изобретаем задержку на 1 секунду
        await delay(1000); // задержка 1 секунда

        const res4 = await request(testApp)
            .post(`${AUTH_PATH}/login`)
            .set("User-Agent", "CustomUserAgentHeader/4.0")
            .send(loginCreds_1);

        expect(res4.status).toBe(HttpStatus.Ok);
        const entriesCount4 = Object.entries(res4.body).length;
        expect(entriesCount4).toBe(1);
        expect(res4.body).toHaveProperty("accessToken");

        const listOfAllSessions =
            await dataQueryRepository.utilGetAllSessionRecords();
        console.log("LIST OF ALL SESSIONS: ", listOfAllSessions);

        if (!userId_1) {
            throw new Error("No user found");
        }

        console.log("ID WER LOOKING FOR: ", userId_1);

        const listOfActiveSessions =
            await dataQueryRepository.getActiveDevicesList(userId_1);
        console.log("LIST OF ACTIVE SESSIONS: ", listOfActiveSessions);

        expect(listOfActiveSessions.length).toBe(4);

    }, 15000);

    it("DELETE '/api/security/devices/:deviceId' - should return error because deviceId inside uri is not viable (not successful)", async () => {
        expect(await UsersQueryRepository.returnUsersAmount()).toBe(4);

        const notViableDeviceId = "1111111111111111111111";
        const res1 = await request(testApp).delete(
            `${SECURITY_DEVICES_PATH}/${notViableDeviceId}`,
        );

        expect(res1.status).toBe(HttpStatus.Unauthorized); // because of refresh cockie not being set
        //
        //
        const listOfAllSessions =
            await dataQueryRepository.utilGetAllSessionRecords();
        console.log("LIST OF ALL SESSIONS - 1: ", listOfAllSessions);

        const res2 = await request(testApp)
            .delete(`${SECURITY_DEVICES_PATH}/${notViableDeviceId}`)
            .set("Cookie", `refreshToken=${refreshTokenValue1}`);

        expect(res2.status).toBe(HttpStatus.NotFound); // because deviceId is incorrect

        // if (!userId_1) {
        //     throw new Error("No user found");
        // }
        //
        // console.log("*********ID WER LOOKING FOR: ", userId_1);
        // const listOfActiveSessions =
        //     await dataQueryRepository.getActiveDevicesList(userId_1);
        // console.log("LIST OF ACTIVE SESSIONS: ", listOfActiveSessions);

        const listOfAllSessions1 =
            await dataQueryRepository.utilGetAllSessionRecords();
        console.log("LIST OF ALL SESSIONS - 2: ", listOfAllSessions1);
    });

    it("POST '/api/auth/refresh-token' - attempt to refresh token (successful)", async () => {
        expect(await UsersQueryRepository.returnUsersAmount()).toBe(4);

        // извлекаем данные из актуального рефреш-токена
        if (!refreshTokenValue1) {
            throw new Error("Refresh cookie is undefined");
        }

        refreshToken1DecodedData =
            await jwtService.decodeRefreshToken(refreshTokenValue1);

        //изобретаем задержку на 2 секунды
        const delay = (ms: number) =>
            new Promise((resolve) => setTimeout(resolve, ms));
        await delay(2000); // задержка 2 секунды
        // console.log("Прошла 2 секунда");

        // Пытаемся обновить токены
        const refreshRes = await request(testApp)
            .post(`${AUTH_PATH}/refresh-token`)
            .set("Cookie", `refreshToken=${refreshTokenValue1}`)
            .send();

        expect(refreshRes.status).toBe(HttpStatus.Ok);
        expect(refreshRes.body.accessToken).toBeDefined();
        expect(refreshRes.header["set-cookie"]).toBeDefined();
        const renewedRefreshCookieValue1 = refreshRes.header["set-cookie"];

        // промежуточное значение для хранения сырого массива кук (если их там много)
        let renewedRefreshTokenValue1: string | undefined;

        {
            if (Array.isArray(renewedRefreshCookieValue1)) {
                renewedRefreshTokenValue1 = renewedRefreshCookieValue1.find(
                    (cookie) =>
                        // имя куки refreshToken определено по ТЗ
                        cookie.startsWith("refreshToken="),
                );
            } else if (typeof renewedRefreshCookieValue1 === "string") {
                renewedRefreshTokenValue1 =
                    renewedRefreshCookieValue1.startsWith("refreshToken=")
                        ? renewedRefreshCookieValue1
                        : undefined;
            }

            // просто доп проверка
            expect(renewedRefreshTokenValue1).toBeDefined();

            // вспомогательная функция для извлечения уже фактического
            const extractJwtFromCookie = (cookieString: string): string => {
                const parts = cookieString.split("=");
                if (parts.length < 2) {
                    throw new Error('Invalid cookie format: no "=" found');
                }
                const jwtWithAttributes = parts[1];
                const jwt = jwtWithAttributes.split(";")[0];
                return jwt;
            };

            if (!renewedRefreshTokenValue1) {
                throw new Error("Refresh cookie is undefined");
            }

            // извлекаем само значение токена за вычетом части строки "refreshToken="
            newRefreshTokenValue1 = extractJwtFromCookie(
                renewedRefreshTokenValue1,
            );
            expect(newRefreshTokenValue1).toMatch(
                /^[a-zA-Z0-9\-_]+\.[a-zA-Z0-9\-_]+\.[a-zA-Z0-9\-_]+$/,
            );
        }

        // декодируем новый рефреш-токен, выдергивая его данные для сравнения со старым токеном
        const newRefreshToken1DecodedData = await jwtService.decodeRefreshToken(
            newRefreshTokenValue1,
        );

        if (!refreshToken1DecodedData || !newRefreshToken1DecodedData) {
            throw new Error(
                "One of refresh-tokens (old or renewed) is undefined",
            );
        }

        // теперь непосредственно сравнение
        // в новом рефреш-токене значения exp и iat должны обновиться,
        // а вот deviceId и userId не должны поменяться, это тот же юзер
        expect(newRefreshToken1DecodedData.iat).not.toEqual(
            refreshToken1DecodedData.iat,
        );
        expect(newRefreshToken1DecodedData.exp).not.toEqual(
            refreshToken1DecodedData.exp,
        );
        expect(newRefreshToken1DecodedData.userId).toEqual(
            refreshToken1DecodedData.userId,
        );
        expect(newRefreshToken1DecodedData.deviceId).toEqual(
            refreshToken1DecodedData.deviceId,
        );

        const listOfAllSessions =
            await dataQueryRepository.utilGetAllSessionRecords();
        console.log("LIST OF ALL SESSIONS - 1: ", listOfAllSessions);

        expect(listOfAllSessions.length).toBe(4); // количество сессий не должно измениться
    });


    // Удаляем девайс 2 из refreshTokenValue2 (для этого передаем newRefreshTokenValue1 девайса 1). Запрашиваем список девайсов. Проверяем, что девайс 2 отсутствует в списке;
    it("DELETE '/api/security/devices/:deviceId' - should delete deviceId which is inside refreshTokenValue2 (successful)", async () => {
        const listOfAllSessions =
            await dataQueryRepository.utilGetAllSessionRecords();
        console.log(
            "LIST OF ALL SESSIONS BEFORE THE DELETION: ",
            listOfAllSessions,
        );

        if (!refreshTokenValue2) {
            throw new Error("Refresh cookie is undefined");
        }
        // декодируем рефреш-токен refreshTokenValue2, выдергивая его данные
        // для использования в удалении и сравнении
        const refreshToken2DecodedData =
            await jwtService.decodeRefreshToken(refreshTokenValue2);

        if (!refreshToken2DecodedData) {
            throw new Error("Refresh token decoded value is undefined");
        }

        console.log("DEVICE ID TO DELETE: ", refreshToken2DecodedData.deviceId);

        const res = await request(testApp)
            .delete(
                `${SECURITY_DEVICES_PATH}/${refreshToken2DecodedData.deviceId}`,
            )
            .set("Cookie", `refreshToken=${newRefreshTokenValue1}`);

        expect(res.status).toBe(HttpStatus.NoContent); // because deviceId is incorrect

        // if (!userId_1) {
        //     throw new Error("No user found");
        // }
        //
        // console.log("*********ID WER LOOKING FOR: ", userId_1);
        // const listOfActiveSessions =
        //     await dataQueryRepository.getActiveDevicesList(userId_1);
        // console.log("LIST OF ACTIVE SESSIONS: ", listOfActiveSessions);

        const listOfAllSessions1 =
            await dataQueryRepository.utilGetAllSessionRecords();
        console.log(
            "LIST OF ALL SESSIONS AFTER THE DELETION: ",
            listOfAllSessions1,
        );

        // количество сессий должно сократиться
        expect(listOfAllSessions1.length).toBe(3);
        // refreshToken2DecodedData.deviceId не должен присутствовать в оставшихся сессиях
        listOfAllSessions1.forEach((session) => {
            if (session.deviceId === refreshToken2DecodedData.deviceId) {
                throw Error(
                    "Error: refreshToken2DecodedData.deviceId is present in the session!",
                );
            }
        });
    });

});
