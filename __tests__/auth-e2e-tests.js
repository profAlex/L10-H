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
const setup_app_1 = require("../src/setup-app");
const mongo_db_1 = require("../src/db/mongo.db");
const router_pathes_1 = require("../src/routers/pathes/router-pathes");
const http_statuses_1 = require("../src/common/http-statuses/http-statuses");
const mailer_service_1 = require("../src/adapters/email-sender/mailer-service");
const UUIDgeneration_1 = require("../src/adapters/randomUUIDgeneration/UUIDgeneration");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const config_1 = require("../src/config");
const composition_root_1 = require("../src/composition-root/composition-root");
const globals_1 = require("@jest/globals");
(0, globals_1.describe)("Test API for managing login, registration and registration-confirmation services", () => {
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
    // let userId_3 :string | undefined = '';
    // let userId_4 :string | undefined = '';
    // let userId_5 :string | undefined = '';
    // let loginCreds_1 = {};
    // let loginCreds_2 = {};
    beforeEach(() => {
        //const bcryptService = new BcryptService();
        //const usersCommandRepository = new UsersCommandRepository(bcryptService);
        // мокаем возвращаемое значение для некоторых тестируемых здесь функций, относящихся в первую очередь к работе с почтовым сервисом
        // это нужно делать в блоке beforeEach, иначе шпион будет накапливать статистику вызовов
        // глобально внутри всего describe, и это будет сбивать логику проверок
        jest.spyOn(mailer_service_1.mailerService, "sendEmailWithCode").mockResolvedValue(true);
        jest.spyOn(UUIDgeneration_1.UUIDgeneration, "generateUUID").mockReturnValue("1-2-3-4-5-6");
    });
    afterEach(() => {
        jest.clearAllMocks(); // сбрасываем статистику вызовов, иначе она будет накапливать счет вызовов
        // или jest.restoreAllMocks()
    });
    (0, globals_1.it)("Creating test user entries, directly without endpoint calls", () => __awaiter(void 0, void 0, void 0, function* () {
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
        //
        // const newUser_3: UserInputModel = {
        //     login: "hello_world_3",
        //     password: "hello_world",
        //     email: "test_email_3@yandex.com",
        // }
        // userId_3 = await dataCommandRepository.createNewUser(newUser_3);
        //
        // const newUser_4: UserInputModel = {
        //     login: "hello_world_4",
        //     password: "hello_world",
        //     email: "test_email_4@yandex.com",
        // }
        // userId_4 = await dataCommandRepository.createNewUser(newUser_4);
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
    (0, globals_1.it)("POST '/api/auth/login' - successful login attempt (response 200)", () => __awaiter(void 0, void 0, void 0, function* () {
        expect(yield composition_root_1.usersQueryRepository.returnUsersAmount()).toBe(2);
        const loginCreds_1 = {
            loginOrEmail: "hello_w2",
            password: "hello_world",
        };
        const res = yield (0, supertest_1.default)(testApp)
            .post(`${router_pathes_1.AUTH_PATH}/login`)
            .send(loginCreds_1);
        expect(res.status).toBe(http_statuses_1.HttpStatus.Ok);
        const entriesCount = Object.entries(res.body).length;
        expect(entriesCount).toBe(1);
        expect(res.body).toHaveProperty("accessToken");
        // console.log(JSON.stringify(res.body));
    }));
    (0, globals_1.it)("POST '/api/auth/login' - unsuccessful login attempt (response 401)", () => __awaiter(void 0, void 0, void 0, function* () {
        expect(yield composition_root_1.usersQueryRepository.returnUsersAmount()).toBe(2);
        const loginCreds_2 = {
            loginOrEmail: "wrong_log",
            password: "hello_world",
        };
        const res = yield (0, supertest_1.default)(testApp)
            .post(`${router_pathes_1.AUTH_PATH}/login`)
            .send(loginCreds_2);
        expect(res.status).toBe(http_statuses_1.HttpStatus.Unauthorized);
        // console.log(JSON.stringify(res.body));
    }));
    (0, globals_1.it)("GET '/api/auth/me' - unsuccessful request (response 401) because of incorrect token sent", () => __awaiter(void 0, void 0, void 0, function* () {
        expect(yield composition_root_1.usersQueryRepository.returnUsersAmount()).toBe(2);
        const res = yield (0, supertest_1.default)(testApp)
            .get(`${router_pathes_1.AUTH_PATH}/me`)
            .set("Authorization", "Bearer " + "sdf");
        expect(res.status).toBe(http_statuses_1.HttpStatus.Unauthorized);
        // console.log(JSON.stringify(res.body));
    }));
    (0, globals_1.it)("POST '/api/auth/registration' - attempt to register via email (successful)", () => __awaiter(void 0, void 0, void 0, function* () {
        expect(yield composition_root_1.usersQueryRepository.returnUsersAmount()).toBe(2);
        const newUserToRegisterViaEmail = {
            login: "new_login",
            email: "geniusb198@yandex.ru",
            password: "new_password",
        };
        const res = yield (0, supertest_1.default)(testApp)
            .post(`${router_pathes_1.AUTH_PATH}/registration`)
            .send(newUserToRegisterViaEmail);
        expect(res.status).toBe(http_statuses_1.HttpStatus.NoContent);
        expect(mailer_service_1.mailerService.sendEmailWithCode).toHaveBeenCalled();
        expect(mailer_service_1.mailerService.sendEmailWithCode).toHaveBeenCalledTimes(1);
    }));
    // it(
    //     "POST '/api/auth/registration' - attempt to register via email (successful)",
    //     async () => {
    //         expect(await dataQueryRepository.returnUsersAmount())
    //             .toBe(3);
    //
    //         const newUserToRegisterViaEmail: RegistrationUserInputModel = {
    //             login: "new_l1gin",
    //             email: "geniusb198@huyandex.ru",
    //             password: "new_password"
    //         };
    //
    //         // // мокаем возвращаемое значение
    //         // jest.spyOn(
    //         //         mailerService,
    //         //         "sendEmailWithCode"
    //         //     )
    //         //     .mockResolvedValue(true);
    //
    //         const res = await request(testApp)
    //             .post(`${AUTH_PATH}/registration`)
    //             .send(newUserToRegisterViaEmail);
    //
    //         // const mockedServiceCall = AuthCommandService.registerNewUser;
    //
    //         expect(res.status)
    //             .toBe(HttpStatus.NoContent);
    //         expect(mailerService.sendEmailWithCode)
    //             .toHaveBeenCalled();
    //         expect(mailerService.sendEmailWithCode)
    //             .toHaveBeenCalledTimes(1);
    //
    //     }
    // );
    (0, globals_1.it)("POST '/api/auth/registration' - attempt to register via email (not successful)", () => __awaiter(void 0, void 0, void 0, function* () {
        expect(yield composition_root_1.usersQueryRepository.returnUsersAmount()).toBe(3);
        const newUserToRegisterViaEmail = {
            login: "hello_wr",
            email: "geniusb198@yandex.ru",
            password: "new_password",
        };
        const newUserToRegisterViaEmail1 = {
            login: "hel_hel",
            email: "test_email@yandex.com",
            password: "new_password",
        };
        // попытка зарегистрироваться с уже имеющимся login
        const res = yield (0, supertest_1.default)(testApp)
            .post(`${router_pathes_1.AUTH_PATH}/registration`)
            .send(newUserToRegisterViaEmail);
        // попытка зарегистрироваться с уже имеющимся email
        const res1 = yield (0, supertest_1.default)(testApp)
            .post(`${router_pathes_1.AUTH_PATH}/registration`)
            .send(newUserToRegisterViaEmail1);
        // const mockedServiceCall = AuthCommandService.registerNewUser;
        expect(res.status).toBe(http_statuses_1.HttpStatus.BadRequest);
        expect(res1.status).toBe(http_statuses_1.HttpStatus.BadRequest);
        // expect(mailerService.sendEmailWithCode)
        // .toHaveBeenCalled();
        expect(mailer_service_1.mailerService.sendEmailWithCode).toHaveBeenCalledTimes(0);
    }));
    (0, globals_1.it)("POST '/api/auth/registration-confirmation' - attempt to confirm registration by sending and accepting registration code (successful)", () => __awaiter(void 0, void 0, void 0, function* () {
        expect(yield composition_root_1.usersQueryRepository.returnUsersAmount()).toBe(3);
        const resentEmail = {
            email: "geniusb198@yandex.ru",
        };
        const res = yield (0, supertest_1.default)(testApp)
            .post(`${router_pathes_1.AUTH_PATH}/registration-email-resending`)
            .send(resentEmail);
        expect(res.status).toBe(http_statuses_1.HttpStatus.NoContent);
        expect(mailer_service_1.mailerService.sendEmailWithCode).toHaveBeenCalled();
        expect(mailer_service_1.mailerService.sendEmailWithCode).toHaveBeenCalledTimes(1);
    }));
    (0, globals_1.it)("POST '/api/auth/registration-confirmation' - attempt to confirm registration by sending and accepting registration code (not successful, cuz incorrect email)", () => __awaiter(void 0, void 0, void 0, function* () {
        expect(yield composition_root_1.usersQueryRepository.returnUsersAmount()).toBe(3);
        const resentEmail = {
            email: "tesssst_email@yandex.com",
        };
        const res = yield (0, supertest_1.default)(testApp)
            .post(`${router_pathes_1.AUTH_PATH}/registration-email-resending`)
            .send(resentEmail);
        expect(res.status).toBe(http_statuses_1.HttpStatus.BadRequest);
        expect(mailer_service_1.mailerService.sendEmailWithCode).not.toHaveBeenCalled();
        // expect(mailerService.sendEmailWithCode)
        //     .toHaveBeenCalledTimes(1);
    }));
    (0, globals_1.it)("POST '/api/auth/registration-email-resending' - attempt to resend registration code (successful)", () => __awaiter(void 0, void 0, void 0, function* () {
        expect(yield composition_root_1.usersQueryRepository.returnUsersAmount()).toBe(3);
        const newUserToRegisterViaEmail = {
            login: "another",
            email: "geniiusb198@yandex.ru",
            password: "new_password",
        };
        const codeConfirmation = { code: "1-2-3-4-5-6" };
        const registrationRes = yield (0, supertest_1.default)(testApp)
            .post(`${router_pathes_1.AUTH_PATH}/registration`)
            .send(newUserToRegisterViaEmail);
        expect(registrationRes.status).toBe(http_statuses_1.HttpStatus.NoContent);
        expect(mailer_service_1.mailerService.sendEmailWithCode).toHaveBeenCalled();
        expect(mailer_service_1.mailerService.sendEmailWithCode).toHaveBeenCalledTimes(1);
        const confirmationRes = yield (0, supertest_1.default)(testApp)
            .post(`${router_pathes_1.AUTH_PATH}/registration-confirmation`)
            .send(codeConfirmation);
        expect(confirmationRes.status).toBe(http_statuses_1.HttpStatus.NoContent);
        expect(UUIDgeneration_1.UUIDgeneration.generateUUID).toHaveBeenCalled();
        expect(UUIDgeneration_1.UUIDgeneration.generateUUID).toHaveBeenCalledTimes(1);
    }));
    (0, globals_1.it)("POST '/api/auth/registration-email-resending' - attempt to resend registration code (not successful)", () => __awaiter(void 0, void 0, void 0, function* () {
        expect(yield composition_root_1.usersQueryRepository.returnUsersAmount()).toBe(4);
        const newUserToRegisterViaEmail = {
            login: "a1other",
            email: "gentusb198@yandex.ru",
            password: "new_password",
        };
        // пробуем неверный код подтверждения передать. Правильный: "1-2-3-4-5-6"
        const wrongCodeConfirmation = { code: "2-2-3-4-5-6" };
        const registrationRes = yield (0, supertest_1.default)(testApp)
            .post(`${router_pathes_1.AUTH_PATH}/registration`)
            .send(newUserToRegisterViaEmail);
        expect(registrationRes.status).toBe(http_statuses_1.HttpStatus.NoContent);
        expect(mailer_service_1.mailerService.sendEmailWithCode).toHaveBeenCalled();
        expect(mailer_service_1.mailerService.sendEmailWithCode).toHaveBeenCalledTimes(1);
        const confirmationRes = yield (0, supertest_1.default)(testApp)
            .post(`${router_pathes_1.AUTH_PATH}/registration-confirmation`)
            .send(wrongCodeConfirmation);
        expect(confirmationRes.status).toBe(http_statuses_1.HttpStatus.BadRequest);
        expect(UUIDgeneration_1.UUIDgeneration.generateUUID).toHaveBeenCalled();
        expect(UUIDgeneration_1.UUIDgeneration.generateUUID).toHaveBeenCalledTimes(1);
    }));
    //********************************************************************************
    (0, globals_1.it)("POST '/api/auth/refresh-token' - attempt to refresh token (successful)", () => __awaiter(void 0, void 0, void 0, function* () {
        expect(yield composition_root_1.usersQueryRepository.returnUsersAmount()).toBe(5);
        // это существующие креды, создавали в первом it
        const loginData = {
            loginOrEmail: "hello_wr",
            password: "hello_world",
        };
        // Получаем текущие токены
        const loginRes = yield (0, supertest_1.default)(testApp)
            .post(`${router_pathes_1.AUTH_PATH}/login`)
            .send(loginData);
        expect(loginRes.status).toBe(http_statuses_1.HttpStatus.Ok);
        expect(loginRes.body.accessToken).toBeDefined();
        expect(loginRes.header["set-cookie"]).toBeDefined();
        const setCookieValue = loginRes.header["set-cookie"];
        let refreshTokenCookie;
        if (Array.isArray(setCookieValue)) {
            refreshTokenCookie = setCookieValue.find((cookie) => 
            // имя куки refreshToken определено по ТЗ
            cookie.startsWith("refreshToken="));
        }
        else if (typeof setCookieValue === "string") {
            refreshTokenCookie = setCookieValue.startsWith("refreshToken=")
                ? setCookieValue
                : undefined;
        }
        expect(refreshTokenCookie).toBeDefined();
        // ниже блок функции для извлечения значения куки
        const extractJwtFromCookie = (cookieString) => {
            // Разделяем строку по первому знаку '='
            const parts = cookieString.split("=");
            if (parts.length < 2) {
                throw new Error('Invalid cookie format: no "=" found');
            }
            // Берём часть после '=' и до первого ';' (атрибуты куки)
            const jwtWithAttributes = parts[1];
            const jwt = jwtWithAttributes.split(";")[0];
            return jwt;
        };
        if (!refreshTokenCookie) {
            throw "Refresh cookie is undefined";
        }
        const refreshTokenValue = extractJwtFromCookie(refreshTokenCookie);
        expect(refreshTokenValue).toMatch(/^[a-zA-Z0-9\-_]+\.[a-zA-Z0-9\-_]+\.[a-zA-Z0-9\-_]+$/); // проверка формата JWT
        console.log(refreshTokenCookie);
        //изобретаем задержку на 1 секунду
        const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
        yield delay(1000); // задержка 1 секунда
        console.log("Прошла 1 секунда");
        // Пытаемся обновить токены
        const refreshRes = yield (0, supertest_1.default)(testApp)
            .post(`${router_pathes_1.AUTH_PATH}/refresh-token`)
            .set("Cookie", `refreshToken=${refreshTokenValue}`)
            .send();
        expect(refreshRes.status).toBe(http_statuses_1.HttpStatus.Ok);
        expect(refreshRes.body.accessToken).toBeDefined();
        expect(refreshRes.header["set-cookie"]).toBeDefined();
        const setNewCookieValue = refreshRes.header["set-cookie"];
        let refreshNewTokenCookie;
        if (Array.isArray(setNewCookieValue)) {
            refreshNewTokenCookie = setNewCookieValue.find((cookie) => 
            // имя куки refreshToken определено по ТЗ
            cookie.startsWith("refreshToken="));
        }
        else if (typeof setNewCookieValue === "string") {
            refreshNewTokenCookie = setNewCookieValue.startsWith("refreshToken=")
                ? setCookieValue
                : undefined;
        }
        expect(refreshNewTokenCookie).toBeDefined();
        console.log(refreshNewTokenCookie);
        expect(refreshRes.body.accessToken).not.toEqual(loginRes.body.accessToken);
        expect(refreshTokenCookie).not.toEqual(refreshNewTokenCookie);
    }));
    (0, globals_1.it)("POST '/api/auth/refresh-token' - attempt to refresh token with expired refresh token (not successful)", () => __awaiter(void 0, void 0, void 0, function* () {
        // Создаём expired JWT
        const expiredRefreshToken = jsonwebtoken_1.default.sign({
            userId_1,
            iat: Math.floor(Date.now() / 1000),
            exp: Math.floor(Date.now() / 1000 - 3600),
        }, config_1.envConfig.refreshTokenSecret);
        // Устанавливаем expired токен в куку
        const refreshRes = yield (0, supertest_1.default)(testApp)
            .post(`${router_pathes_1.AUTH_PATH}/refresh-token`)
            .set("Cookie", `refreshToken=${expiredRefreshToken}`)
            .send();
        expect(refreshRes.status).toBe(http_statuses_1.HttpStatus.Unauthorized);
    }));
    (0, globals_1.it)("POST '/api/auth/refresh-token' - attempt to refresh token with malformed refresh token (not successful)", () => __awaiter(void 0, void 0, void 0, function* () {
        const malformedRefreshToken = "invalid_token_format";
        const refreshRes = yield (0, supertest_1.default)(testApp)
            .post(`${router_pathes_1.AUTH_PATH}/refresh-token`)
            .set("Cookie", `refreshToken=${malformedRefreshToken}`)
            .send();
        expect(refreshRes.status).toBe(http_statuses_1.HttpStatus.Unauthorized);
    }));
    (0, globals_1.it)("POST '/api/auth/logout' - attempt to logout (successful)", () => __awaiter(void 0, void 0, void 0, function* () {
        expect(yield composition_root_1.usersQueryRepository.returnUsersAmount()).toBe(5);
        const loginData = {
            loginOrEmail: "hello_w2",
            password: "hello_world",
        };
        // Логинимся, чтобы получить refresh token в куках
        const loginRes = yield (0, supertest_1.default)(testApp)
            .post(`${router_pathes_1.AUTH_PATH}/login`)
            .send(loginData);
        expect(loginRes.status).toBe(http_statuses_1.HttpStatus.Ok);
        expect(loginRes.header["set-cookie"]).toBeDefined();
        // Извлекаем refresh token из кук
        const setCookieValue = loginRes.header["set-cookie"];
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
        const refreshTokenValue = extractJwtFromCookie(refreshTokenCookie);
        expect(refreshTokenValue).toMatch(/^[a-zA-Z0-9\-_]+\.[a-zA-Z0-9\-_]+\.[a-zA-Z0-9\-_]+$/);
        // Выполняем logout, передавая refresh token в куках
        const logoutRes = yield (0, supertest_1.default)(testApp)
            .post(`${router_pathes_1.AUTH_PATH}/logout`)
            .set("Cookie", `refreshToken=${refreshTokenValue}`)
            .send();
        expect(logoutRes.status).toBe(http_statuses_1.HttpStatus.NoContent);
        // Проверяем, что refresh token больше не действителен
        const refreshResAfterLogout = yield (0, supertest_1.default)(testApp)
            .post(`${router_pathes_1.AUTH_PATH}/refresh-token`)
            .set("Cookie", `refreshToken=${refreshTokenValue}`)
            .send();
        expect(refreshResAfterLogout.status).toBe(http_statuses_1.HttpStatus.Unauthorized);
    }));
    (0, globals_1.it)("POST '/api/auth/logout' - attempt to logout with invalid refresh token (not successful)", () => __awaiter(void 0, void 0, void 0, function* () {
        const invalidRefreshToken = "invalid_refresh_token";
        const logoutRes = yield (0, supertest_1.default)(testApp)
            .post(`${router_pathes_1.AUTH_PATH}/logout`)
            .set("Cookie", `refreshToken=${invalidRefreshToken}`)
            .send();
        expect(logoutRes.status).toBe(http_statuses_1.HttpStatus.Unauthorized);
    }));
    (0, globals_1.it)("POST '/api/auth/logout' - attempt to logout without refresh token (not successful)", () => __awaiter(void 0, void 0, void 0, function* () {
        const logoutRes = yield (0, supertest_1.default)(testApp)
            .post(`${router_pathes_1.AUTH_PATH}/logout`)
            .send(); // без кук
        expect(logoutRes.status).toBe(http_statuses_1.HttpStatus.Unauthorized);
    }));
});
function beforeAll(arg0) {
    throw new Error("Function not implemented.");
}
function afterAll(arg0) {
    throw new Error("Function not implemented.");
}
function expect(status) {
    throw new Error("Function not implemented.");
}
