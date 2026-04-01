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
const command_repository_1 = require("../src/repository-layers/command-repository-layer/command-repository");
const http_statuses_1 = require("../src/common/http-statuses/http-statuses");
const query_repository_1 = require("../src/repository-layers/query-repository-layer/query-repository");
const mailer_service_1 = require("../src/adapters/email-sender/mailer-service");
const UUIDgeneration_1 = require("../src/adapters/randomUUIDgeneration/UUIDgeneration");
describe("Test IP request restriction system", () => {
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
    it("Creating test user entries, directly without endpoint calls", () => __awaiter(void 0, void 0, void 0, function* () {
        const newUser_1 = {
            login: "hello_wr",
            password: "hello_world",
            email: "test_email@yandex.com",
        };
        userId_1 = yield command_repository_1.dataCommandRepository.createNewUser(newUser_1);
        const newUser_2 = {
            login: "hello_w2",
            password: "hello_world",
            email: "test_email_2@yandex.com",
        };
        userId_2 = yield command_repository_1.dataCommandRepository.createNewUser(newUser_2);
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
    }), 10000);
    // it("POST '/api/auth/login' - successful login attempt (response 200)", async () => {
    //     expect(await dataQueryRepository.returnUsersAmount()).toBe(2);
    //
    //     const loginCreds_1 = {
    //         loginOrEmail: "hello_w2",
    //         password: "hello_world",
    //     };
    //
    //     const res = await request(testApp)
    //         .post(`${AUTH_PATH}/login`)
    //         .send(loginCreds_1);
    //
    //     expect(res.status).toBe(HttpStatus.Ok);
    //     const entriesCount = Object.entries(res.body).length;
    //     expect(entriesCount).toBe(1);
    //
    //     expect(res.body).toHaveProperty("accessToken");
    //
    //     // console.log(JSON.stringify(res.body));
    // });
    //
    // it("POST '/api/auth/login' - unsuccessful login attempt (response 401)", async () => {
    //     expect(await dataQueryRepository.returnUsersAmount()).toBe(2);
    //
    //     const loginCreds_2 = {
    //         loginOrEmail: "wrong_log",
    //         password: "hello_world",
    //     };
    //
    //     const res = await request(testApp)
    //         .post(`${AUTH_PATH}/login`)
    //         .send(loginCreds_2);
    //
    //     expect(res.status).toBe(HttpStatus.Unauthorized);
    //
    //     // console.log(JSON.stringify(res.body));
    // });
    //
    // it("GET '/api/auth/me' - unsuccessful request (response 401) because of incorrect token sent", async () => {
    //     expect(await dataQueryRepository.returnUsersAmount()).toBe(2);
    //
    //     const res = await request(testApp)
    //         .get(`${AUTH_PATH}/me`)
    //         .set("Authorization", "Bearer " + "sdf");
    //
    //     expect(res.status).toBe(HttpStatus.Unauthorized);
    //
    //     // console.log(JSON.stringify(res.body));
    // });
    it("POST '/api/auth/registration' - attempt to register via email (5 attempts successful, then 1 with 429 error, then wait 5 sec, then last one successful attempt)", () => __awaiter(void 0, void 0, void 0, function* () {
        expect(yield query_repository_1.dataQueryRepository.returnUsersAmount()).toBe(2);
        const arrayOfUserRegistrationData = [
            {
                login: "new_login1",
                email: "geniusb1@yandex.ru",
                password: "new_password",
            },
            {
                login: "new_login2",
                email: "geniusb2@yandex.ru",
                password: "new_password",
            },
            {
                login: "new_login3",
                email: "geniusb3@yandex.ru",
                password: "new_password",
            },
            {
                login: "new_login4",
                email: "geniusb4@yandex.ru",
                password: "new_password",
            },
            {
                login: "new_login5",
                email: "geniusb5@yandex.ru",
                password: "new_password",
            },
            {
                login: "new_login6",
                email: "geniusb6@yandex.ru",
                password: "new_password",
            },
        ];
        //изобретаем задержку на 1 секунду
        const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
        const numberOfTries = 5;
        for (let i = 0; i < numberOfTries; i++) {
            const res = yield (0, supertest_1.default)(testApp)
                .post(`${router_pathes_1.AUTH_PATH}/registration`)
                .set("User-Agent", "CustomUserAgentHeader/1.0")
                .send(arrayOfUserRegistrationData[i]);
            expect(res.status).toBe(http_statuses_1.HttpStatus.NoContent);
            expect(mailer_service_1.mailerService.sendEmailWithCode).toHaveBeenCalled();
            yield delay(1000); // задержка 1 секунда
            console.log("COUNT TRIES: ", i + 1);
        }
        expect(mailer_service_1.mailerService.sendEmailWithCode).toHaveBeenCalledTimes(5);
        const restrictedSessionsList = yield query_repository_1.dataQueryRepository.utilGetAllRestrictedSessionRecords();
        console.log("RESTRICTED SESSION STORAGE 1: ", restrictedSessionsList);
        const res = yield (0, supertest_1.default)(testApp)
            .post(`${router_pathes_1.AUTH_PATH}/registration`)
            .set("User-Agent", "CustomUserAgentHeader/1.0")
            .send(arrayOfUserRegistrationData[5]);
        expect(res.status).toBe(http_statuses_1.HttpStatus.TooManyRequests);
        expect(mailer_service_1.mailerService.sendEmailWithCode).toHaveBeenCalled();
        const res1 = yield (0, supertest_1.default)(testApp)
            .post(`${router_pathes_1.AUTH_PATH}/registration`)
            .set("User-Agent", "CustomUserAgentHeader/1.0")
            .send(arrayOfUserRegistrationData[5]);
        expect(res1.status).toBe(http_statuses_1.HttpStatus.TooManyRequests);
        expect(mailer_service_1.mailerService.sendEmailWithCode).toHaveBeenCalled();
        yield delay(5000); // задержка 5 секунд
        const res2 = yield (0, supertest_1.default)(testApp)
            .post(`${router_pathes_1.AUTH_PATH}/registration`)
            .set("User-Agent", "CustomUserAgentHeader/1.0")
            .send(arrayOfUserRegistrationData[5]);
        expect(res2.status).toBe(http_statuses_1.HttpStatus.NoContent);
        expect(mailer_service_1.mailerService.sendEmailWithCode).toHaveBeenCalled();
        const restrictedSessionsList1 = yield query_repository_1.dataQueryRepository.utilGetAllRestrictedSessionRecords();
        console.log("RESTRICTED SESSION STORAGE 2: ", restrictedSessionsList1);
    }), 25000);
    it("POST '/api/auth/registration-confirmation' - attempt to confirm registration by sending and accepting registration code (5 attempts successful, then 1 with 429 error, then wait 5 sec, then last one successful attempt) ", () => __awaiter(void 0, void 0, void 0, function* () {
        const registrationCode = {
            code: "1-2-3-4-5-6",
        };
        //изобретаем задержку на 1 секунду
        const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
        const numberOfTries = 5;
        for (let i = 0; i < numberOfTries; i++) {
            const res = yield (0, supertest_1.default)(testApp)
                .post(`${router_pathes_1.AUTH_PATH}/registration-confirmation`)
                .send(registrationCode);
            expect(res.status).toBe(http_statuses_1.HttpStatus.NoContent);
            yield delay(1000); // задержка 1 секунда
            console.log("COUNT TRIES: ", i + 1);
        }
        // шестой вызов внутри 10-ти секундного интервала, должен будет вернуть ошибку
        const res1 = yield (0, supertest_1.default)(testApp)
            .post(`${router_pathes_1.AUTH_PATH}/registration-confirmation`)
            .send(registrationCode);
        expect(res1.status).toBe(http_statuses_1.HttpStatus.TooManyRequests);
        yield delay(5000); // задержка 5 секунд, чтобы перешагнуть 10-ти секундный барьер, после которого можно снова пробовать отсылать
        const res2 = yield (0, supertest_1.default)(testApp)
            .post(`${router_pathes_1.AUTH_PATH}/registration-confirmation`)
            .send(registrationCode);
        expect(res2.status).toBe(http_statuses_1.HttpStatus.NoContent);
    }), 25000);
    it("POST '/api/auth/registration-email-resending' - attempt to resend registration code (successful)", () => __awaiter(void 0, void 0, void 0, function* () {
        const newUserRegistrationData = {
            login: "new_login8",
            email: "geniusb8@yandex.ru",
            password: "new_password",
        };
        // создаем еще один тестовый аккаунт, на который будем отправлять емейл с кодами подтверждения
        const resAdditinalLogin = yield (0, supertest_1.default)(testApp)
            .post(`${router_pathes_1.AUTH_PATH}/registration`)
            .set("User-Agent", "CustomUserAgentHeader/7.0")
            .send(newUserRegistrationData);
        expect(resAdditinalLogin.status).toBe(http_statuses_1.HttpStatus.NoContent);
        expect(mailer_service_1.mailerService.sendEmailWithCode).toHaveBeenCalled();
        const emailToResendRegistration = {
            email: "geniusb8@yandex.ru",
        };
        //изобретаем задержку на 1 секунду
        const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
        const numberOfTries = 5;
        for (let i = 0; i < numberOfTries; i++) {
            const res = yield (0, supertest_1.default)(testApp)
                .post(`${router_pathes_1.AUTH_PATH}/registration-email-resending`)
                .send(emailToResendRegistration);
            expect(res.status).toBe(http_statuses_1.HttpStatus.NoContent);
            expect(mailer_service_1.mailerService.sendEmailWithCode).toHaveBeenCalled();
            yield delay(1000); // задержка 1 секунда
            console.log("COUNT TRIES: ", i + 1);
        }
        expect(mailer_service_1.mailerService.sendEmailWithCode).toHaveBeenCalledTimes(6);
        // шестой вызов внутри 10-ти секундного интервала, должен будет вернуть ошибку
        const res1 = yield (0, supertest_1.default)(testApp)
            .post(`${router_pathes_1.AUTH_PATH}/registration-email-resending`)
            .send(emailToResendRegistration);
        expect(res1.status).toBe(http_statuses_1.HttpStatus.TooManyRequests);
        expect(mailer_service_1.mailerService.sendEmailWithCode).toHaveBeenCalled();
        yield delay(5000); // задержка 5 секунд, чтобы перешагнуть 10-ти секундный барьер, после которого можно снова пробовать отсылать
        // еще раз пробуем, после того как перешагнули порог 10-ти секунд
        const res2 = yield (0, supertest_1.default)(testApp)
            .post(`${router_pathes_1.AUTH_PATH}/registration-email-resending`)
            .send(emailToResendRegistration);
        expect(res2.status).toBe(http_statuses_1.HttpStatus.NoContent);
        expect(mailer_service_1.mailerService.sendEmailWithCode).toHaveBeenCalled();
    }), 25000);
});
