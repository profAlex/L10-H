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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const supertest_1 = __importDefault(require("supertest"));
const router_pathes_1 = require("../src/routers/pathes/router-pathes");
const setup_app_1 = require("../src/setup-app");
const mongo_db_1 = require("../src/db/mongo.db");
const query_repository_1 = require("../src/repository-layers/query-repository-layer/query-repository");
const http_statuses_1 = require("../src/common/http-statuses/http-statuses");
const jwt_service_1 = require("../src/adapters/verification/jwt-service");
const composition_root_1 = require("../src/composition-root/composition-root");
describe("Test API for managing session life-time and updated refresh-token renewal system", () => {
    const testApp = (0, express_1.default)();
    (0, setup_app_1.setupApp)(testApp);
    beforeAll(() => __awaiter(void 0, void 0, void 0, function* () {
        yield (0, mongo_db_1.runDB)();
        const res = yield (0, supertest_1.default)(testApp).delete(`${router_pathes_1.TESTING_PATH}/all-data`);
        expect(res.status).toBe(204);
    }));
    afterAll(() => __awaiter(void 0, void 0, void 0, function* () {
        const res = yield (0, supertest_1.default)(testApp).delete(`${router_pathes_1.TESTING_PATH}/all-data`);
        expect(res.status).toBe(204);
        // Закрываем после всех тестов
        yield (0, mongo_db_1.closeDB)();
    }));
    let userId_1 = "";
    let userId_2 = "";
    let userId_3 = "";
    let userId_4 = "";
    let refreshTokenValue1 = "";
    let newRefreshTokenValue1 = "";
    let refreshTokenValue2 = "";
    let refreshTokenValue3 = "";
    let refreshTokenValue4 = "";
    let refreshToken1DecodedData = null;
    // let loginCreds_1 = {};
    // let loginCreds_2 = {};
    // beforeEach(() => {
    //     // мокаем возвращаемое значение для некоторых тестируемых здесь функций, относящихся в первую очередь к работе с почтовым сервисом
    //     // это нужно делать в блоке beforeEach, иначе шпион будет накапливать статистику вызовов
    //     // глобально внутри всего describe, и это будет сбивать логику проверок
    //     jest.spyOn(
    //         mailerService,
    //         "sendEmailWithCode",
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
    it("Creating test user entries, directly without endpoint calls", () => __awaiter(void 0, void 0, void 0, function* () {
        const newUser_1 = {
            login: "hello_wr",
            password: "hello_world",
            email: "test_email@yandex.com",
        };
        userId_1 = yield composition_root_1.usersCommandRepository.createNewUser(newUser_1);
        const newUser_2 = {
            login: "hello_w2",
            password: "hello_world",
            email: "test_email_2@yandex.com",
        };
        userId_2 = yield composition_root_1.usersCommandRepository.createNewUser(newUser_2);
        const newUser_3 = {
            login: "hello_world_3",
            password: "hello_world",
            email: "test_email_3@yandex.com",
        };
        userId_3 = yield composition_root_1.usersCommandRepository.createNewUser(newUser_3);
        const newUser_4 = {
            login: "hello_world_4",
            password: "hello_world",
            email: "test_email_4@yandex.com",
        };
        userId_4 = yield composition_root_1.usersCommandRepository.createNewUser(newUser_4);
        // loginCreds_1 = {
        //     loginOrEmail: "hello_wrld1",
        //     password: "hello_world",
        // };
        //
        // loginCreds_2 = {
        //     loginOrEmail: "wrong_log",
        //     password: "hello_world",
        // };
    }));
    it("GET '/api/security/devices' - should return proper amount of active sessions(devices) equal tp 4", () => __awaiter(void 0, void 0, void 0, function* () {
        expect(yield composition_root_1.usersQueryRepository.returnUsersAmount()).toBe(4);
        const loginCreds_1 = {
            loginOrEmail: "hello_wr",
            password: "hello_world",
        };
        const res1 = yield (0, supertest_1.default)(testApp)
            .post(`${router_pathes_1.AUTH_PATH}/login`)
            .set("User-Agent", "CustomUserAgentHeader/1.0")
            .send(loginCreds_1);
        expect(res1.status).toBe(http_statuses_1.HttpStatus.Ok);
        const entriesCount1 = Object.entries(res1.body).length;
        expect(entriesCount1).toBe(1);
        expect(res1.body).toHaveProperty("accessToken");
        //******* В этом блоке выдираем рефреш-куку,
        // возвращенную при логине для использование в последующих тест-блоках
        {
            expect(res1.header["set-cookie"]).toBeDefined();
            // Извлекаем refresh token из кук
            const setCookieValue = res1.header["set-cookie"];
            let refreshTokenCookie;
            if (Array.isArray(setCookieValue)) {
                refreshTokenCookie = setCookieValue.find((cookie) => cookie.startsWith("refreshToken="));
            }
            else if (typeof setCookieValue === "string") {
                refreshTokenCookie = setCookieValue.startsWith("refreshToken=")
                    ? setCookieValue
                    : undefined;
            }
            expect(refreshTokenCookie).toBeDefined();
            // вспомогательная функция
            const extractJwtFromCookie = (cookieString) => {
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
            expect(refreshTokenValue1).toMatch(/^[a-zA-Z0-9\-_]+\.[a-zA-Z0-9\-_]+\.[a-zA-Z0-9\-_]+$/);
        }
        // ********
        const res2 = yield (0, supertest_1.default)(testApp)
            .post(`${router_pathes_1.AUTH_PATH}/login`)
            .set("User-Agent", "CustomUserAgentHeader/2.0")
            .send(loginCreds_1);
        expect(res2.status).toBe(http_statuses_1.HttpStatus.Ok);
        const entriesCount2 = Object.entries(res2.body).length;
        expect(entriesCount2).toBe(1);
        expect(res2.body).toHaveProperty("accessToken");
        //******* В этом блоке выдираем рефреш-куку,
        // возвращенную при логине для использование в последующих тест-блоках
        expect(res2.header["set-cookie"]).toBeDefined();
        // Извлекаем refresh token из кук
        {
            const setCookieValue = res2.header["set-cookie"];
            let refreshTokenCookie;
            if (Array.isArray(setCookieValue)) {
                refreshTokenCookie = setCookieValue.find((cookie) => cookie.startsWith("refreshToken="));
            }
            else if (typeof setCookieValue === "string") {
                refreshTokenCookie = setCookieValue.startsWith("refreshToken=")
                    ? setCookieValue
                    : undefined;
            }
            expect(refreshTokenCookie).toBeDefined();
            // вспомогательная функция
            const extractJwtFromCookie = (cookieString) => {
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
            expect(refreshTokenValue1).toMatch(/^[a-zA-Z0-9\-_]+\.[a-zA-Z0-9\-_]+\.[a-zA-Z0-9\-_]+$/);
        }
        // ********
        //изобретаем задержку на 1 секунду
        const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
        yield delay(1000); // задержка 1 секунда
        const res3 = yield (0, supertest_1.default)(testApp)
            .post(`${router_pathes_1.AUTH_PATH}/login`)
            .set("User-Agent", "CustomUserAgentHeader/3.0")
            .send(loginCreds_1);
        expect(res3.status).toBe(http_statuses_1.HttpStatus.Ok);
        const entriesCount3 = Object.entries(res3.body).length;
        expect(entriesCount3).toBe(1);
        expect(res3.body).toHaveProperty("accessToken");
        //изобретаем задержку на 1 секунду
        yield delay(1000); // задержка 1 секунда
        const res4 = yield (0, supertest_1.default)(testApp)
            .post(`${router_pathes_1.AUTH_PATH}/login`)
            .set("User-Agent", "CustomUserAgentHeader/4.0")
            .send(loginCreds_1);
        expect(res4.status).toBe(http_statuses_1.HttpStatus.Ok);
        const entriesCount4 = Object.entries(res4.body).length;
        expect(entriesCount4).toBe(1);
        expect(res4.body).toHaveProperty("accessToken");
        const listOfAllSessions = yield query_repository_1.dataQueryRepository.utilGetAllSessionRecords();
        console.log("LIST OF ALL SESSIONS: ", listOfAllSessions);
        if (!userId_1) {
            throw new Error("No user found");
        }
        console.log("ID WER LOOKING FOR: ", userId_1);
        const listOfActiveSessions = yield query_repository_1.dataQueryRepository.getActiveDevicesList(userId_1);
        console.log("LIST OF ACTIVE SESSIONS: ", listOfActiveSessions);
        expect(listOfActiveSessions.length).toBe(4);
    }), 15000);
    it("DELETE '/api/security/devices/:deviceId' - should return error because deviceId inside uri is not viable (not successful)", () => __awaiter(void 0, void 0, void 0, function* () {
        expect(yield composition_root_1.usersQueryRepository.returnUsersAmount()).toBe(4);
        const notViableDeviceId = "1111111111111111111111";
        const res1 = yield (0, supertest_1.default)(testApp).delete(`${router_pathes_1.SECURITY_DEVICES_PATH}/${notViableDeviceId}`);
        expect(res1.status).toBe(http_statuses_1.HttpStatus.Unauthorized); // because of refresh cockie not being set
        //
        //
        const listOfAllSessions = yield query_repository_1.dataQueryRepository.utilGetAllSessionRecords();
        console.log("LIST OF ALL SESSIONS - 1: ", listOfAllSessions);
        const res2 = yield (0, supertest_1.default)(testApp)
            .delete(`${router_pathes_1.SECURITY_DEVICES_PATH}/${notViableDeviceId}`)
            .set("Cookie", `refreshToken=${refreshTokenValue1}`);
        expect(res2.status).toBe(http_statuses_1.HttpStatus.NotFound); // because deviceId is incorrect
        // if (!userId_1) {
        //     throw new Error("No user found");
        // }
        //
        // console.log("*********ID WER LOOKING FOR: ", userId_1);
        // const listOfActiveSessions =
        //     await dataQueryRepository.getActiveDevicesList(userId_1);
        // console.log("LIST OF ACTIVE SESSIONS: ", listOfActiveSessions);
        const listOfAllSessions1 = yield query_repository_1.dataQueryRepository.utilGetAllSessionRecords();
        console.log("LIST OF ALL SESSIONS - 2: ", listOfAllSessions1);
    }));
    it("POST '/api/auth/refresh-token' - attempt to refresh token (successful)", () => __awaiter(void 0, void 0, void 0, function* () {
        expect(yield composition_root_1.usersQueryRepository.returnUsersAmount()).toBe(4);
        // извлекаем данные из актуального рефреш-токена
        if (!refreshTokenValue1) {
            throw new Error("Refresh cookie is undefined");
        }
        refreshToken1DecodedData =
            yield jwt_service_1.jwtService.decodeRefreshToken(refreshTokenValue1);
        //изобретаем задержку на 2 секунды
        const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
        yield delay(2000); // задержка 2 секунды
        // console.log("Прошла 2 секунда");
        // Пытаемся обновить токены
        const refreshRes = yield (0, supertest_1.default)(testApp)
            .post(`${router_pathes_1.AUTH_PATH}/refresh-token`)
            .set("Cookie", `refreshToken=${refreshTokenValue1}`)
            .send();
        expect(refreshRes.status).toBe(http_statuses_1.HttpStatus.Ok);
        expect(refreshRes.body.accessToken).toBeDefined();
        expect(refreshRes.header["set-cookie"]).toBeDefined();
        const renewedRefreshCookieValue1 = refreshRes.header["set-cookie"];
        // промежуточное значение для хранения сырого массива кук (если их там много)
        let renewedRefreshTokenValue1;
        {
            if (Array.isArray(renewedRefreshCookieValue1)) {
                renewedRefreshTokenValue1 = renewedRefreshCookieValue1.find((cookie) => 
                // имя куки refreshToken определено по ТЗ
                cookie.startsWith("refreshToken="));
            }
            else if (typeof renewedRefreshCookieValue1 === "string") {
                renewedRefreshTokenValue1 =
                    renewedRefreshCookieValue1.startsWith("refreshToken=")
                        ? renewedRefreshCookieValue1
                        : undefined;
            }
            // просто доп проверка
            expect(renewedRefreshTokenValue1).toBeDefined();
            // вспомогательная функция для извлечения уже фактического
            const extractJwtFromCookie = (cookieString) => {
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
            newRefreshTokenValue1 = extractJwtFromCookie(renewedRefreshTokenValue1);
            expect(newRefreshTokenValue1).toMatch(/^[a-zA-Z0-9\-_]+\.[a-zA-Z0-9\-_]+\.[a-zA-Z0-9\-_]+$/);
        }
        // декодируем новый рефреш-токен, выдергивая его данные для сравнения со старым токеном
        const newRefreshToken1DecodedData = yield jwt_service_1.jwtService.decodeRefreshToken(newRefreshTokenValue1);
        if (!refreshToken1DecodedData || !newRefreshToken1DecodedData) {
            throw new Error("One of refresh-tokens (old or renewed) is undefined");
        }
        // теперь непосредственно сравнение
        // в новом рефреш-токене значения exp и iat должны обновиться,
        // а вот deviceId и userId не должны поменяться, это тот же юзер
        expect(newRefreshToken1DecodedData.iat).not.toEqual(refreshToken1DecodedData.iat);
        expect(newRefreshToken1DecodedData.exp).not.toEqual(refreshToken1DecodedData.exp);
        expect(newRefreshToken1DecodedData.userId).toEqual(refreshToken1DecodedData.userId);
        expect(newRefreshToken1DecodedData.deviceId).toEqual(refreshToken1DecodedData.deviceId);
        const listOfAllSessions = yield query_repository_1.dataQueryRepository.utilGetAllSessionRecords();
        console.log("LIST OF ALL SESSIONS - 1: ", listOfAllSessions);
        expect(listOfAllSessions.length).toBe(4); // количество сессий не должно измениться
    }));
    // Удаляем девайс 2 из refreshTokenValue2 (для этого передаем newRefreshTokenValue1 девайса 1). Запрашиваем список девайсов. Проверяем, что девайс 2 отсутствует в списке;
    it("DELETE '/api/security/devices/:deviceId' - should delete deviceId which is inside refreshTokenValue2 (successful)", () => __awaiter(void 0, void 0, void 0, function* () {
        const listOfAllSessions = yield query_repository_1.dataQueryRepository.utilGetAllSessionRecords();
        console.log("LIST OF ALL SESSIONS BEFORE THE DELETION: ", listOfAllSessions);
        if (!refreshTokenValue2) {
            throw new Error("Refresh cookie is undefined");
        }
        // декодируем рефреш-токен refreshTokenValue2, выдергивая его данные
        // для использования в удалении и сравнении
        const refreshToken2DecodedData = yield jwt_service_1.jwtService.decodeRefreshToken(refreshTokenValue2);
        if (!refreshToken2DecodedData) {
            throw new Error("Refresh token decoded value is undefined");
        }
        console.log("DEVICE ID TO DELETE: ", refreshToken2DecodedData.deviceId);
        const res = yield (0, supertest_1.default)(testApp)
            .delete(`${router_pathes_1.SECURITY_DEVICES_PATH}/${refreshToken2DecodedData.deviceId}`)
            .set("Cookie", `refreshToken=${newRefreshTokenValue1}`);
        expect(res.status).toBe(http_statuses_1.HttpStatus.NoContent); // because deviceId is incorrect
        // if (!userId_1) {
        //     throw new Error("No user found");
        // }
        //
        // console.log("*********ID WER LOOKING FOR: ", userId_1);
        // const listOfActiveSessions =
        //     await dataQueryRepository.getActiveDevicesList(userId_1);
        // console.log("LIST OF ACTIVE SESSIONS: ", listOfActiveSessions);
        const listOfAllSessions1 = yield query_repository_1.dataQueryRepository.utilGetAllSessionRecords();
        console.log("LIST OF ALL SESSIONS AFTER THE DELETION: ", listOfAllSessions1);
        // количество сессий должно сократиться
        expect(listOfAllSessions1.length).toBe(3);
        // refreshToken2DecodedData.deviceId не должен присутствовать в оставшихся сессиях
        listOfAllSessions1.forEach((session) => {
            if (session.deviceId === refreshToken2DecodedData.deviceId) {
                throw Error("Error: refreshToken2DecodedData.deviceId is present in the session!");
            }
        });
    }));
});
