import express from "express";
import request from "supertest";
import { setupApp } from "../src/setup-app";
import { closeDB, runDB } from "../src/db/mongo.db";
import { AUTH_PATH, TESTING_PATH } from "../src/routers/pathes/router-pathes";
import { UserInputModel } from "../src/routers/router-types/user-input-model";
import { dataCommandRepository } from "../src/repository-layers/command-repository-layer/command-repository";
import { HttpStatus } from "../src/common/http-statuses/http-statuses";
import { dataQueryRepository } from "../src/repository-layers/query-repository-layer/query-repository";
import { RegistrationUserInputModel } from "../src/routers/router-types/auth-registration-input-model";
import { mailerService } from "../src/adapters/email-sender/mailer-service";
import { ResentRegistrationConfirmationInput } from "../src/routers/router-types/auth-resent-registration-confirmation-input-model";
import { UUIDgeneration } from "../src/adapters/randomUUIDgeneration/UUIDgeneration";
import { LoginInputModel } from "../src/routers/router-types/login-input-model";
import jwt from "jsonwebtoken";
import { envConfig } from "../src/config";

describe("Test API for managing login, registration and registration-confirmation services", () => {
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
    // let userId_3 :string | undefined = '';
    // let userId_4 :string | undefined = '';
    // let userId_5 :string | undefined = '';

    // let loginCreds_1 = {};
    // let loginCreds_2 = {};

    beforeEach(() => {
        // мокаем возвращаемое значение для некоторых тестируемых здесь функций, относящихся в первую очередь к работе с почтовым сервисом
        // это нужно делать в блоке beforeEach, иначе шпион будет накапливать статистику вызовов
        // глобально внутри всего describe, и это будет сбивать логику проверок
        jest.spyOn(
            mailerService,
            "sendConfirmationRegisterEmail",
        ).mockResolvedValue(true);

        jest.spyOn(UUIDgeneration, "generateUUID").mockReturnValue(
            "1-2-3-4-5-6",
        );
    });

    afterEach(() => {
        jest.clearAllMocks(); // сбрасываем статистику вызовов, иначе она будет накапливать счет вызовов
        // или jest.restoreAllMocks()
    });

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
    });

    it("POST '/api/auth/login' - successful login attempt (response 200)", async () => {
        expect(await dataQueryRepository.returnUsersAmount()).toBe(2);

        const loginCreds_1 = {
            loginOrEmail: "hello_w2",
            password: "hello_world",
        };

        const res = await request(testApp)
            .post(`${AUTH_PATH}/login`)
            .send(loginCreds_1);

        expect(res.status).toBe(HttpStatus.Ok);
        const entriesCount = Object.entries(res.body).length;
        expect(entriesCount).toBe(1);

        expect(res.body).toHaveProperty("accessToken");

        // console.log(JSON.stringify(res.body));
    });

    it("POST '/api/auth/login' - unsuccessful login attempt (response 401)", async () => {
        expect(await dataQueryRepository.returnUsersAmount()).toBe(2);

        const loginCreds_2 = {
            loginOrEmail: "wrong_log",
            password: "hello_world",
        };

        const res = await request(testApp)
            .post(`${AUTH_PATH}/login`)
            .send(loginCreds_2);

        expect(res.status).toBe(HttpStatus.Unauthorized);

        // console.log(JSON.stringify(res.body));
    });

    it("GET '/api/auth/me' - unsuccessful request (response 401) because of incorrect token sent", async () => {
        expect(await dataQueryRepository.returnUsersAmount()).toBe(2);

        const res = await request(testApp)
            .get(`${AUTH_PATH}/me`)
            .set("Authorization", "Bearer " + "sdf");

        expect(res.status).toBe(HttpStatus.Unauthorized);

        // console.log(JSON.stringify(res.body));
    });

    it("POST '/api/auth/registration' - attempt to register via email (successful)", async () => {
        expect(await dataQueryRepository.returnUsersAmount()).toBe(2);

        const newUserToRegisterViaEmail: RegistrationUserInputModel = {
            login: "new_login",
            email: "geniusb198@yandex.ru",
            password: "new_password",
        };

        const res = await request(testApp)
            .post(`${AUTH_PATH}/registration`)
            .send(newUserToRegisterViaEmail);

        expect(res.status).toBe(HttpStatus.NoContent);
        expect(mailerService.sendConfirmationRegisterEmail).toHaveBeenCalled();
        expect(
            mailerService.sendConfirmationRegisterEmail,
        ).toHaveBeenCalledTimes(1);
    });

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
    //         //         "sendConfirmationRegisterEmail"
    //         //     )
    //         //     .mockResolvedValue(true);
    //
    //         const res = await request(testApp)
    //             .post(`${AUTH_PATH}/registration`)
    //             .send(newUserToRegisterViaEmail);
    //
    //         // const mockedServiceCall = authService.registerNewUser;
    //
    //         expect(res.status)
    //             .toBe(HttpStatus.NoContent);
    //         expect(mailerService.sendConfirmationRegisterEmail)
    //             .toHaveBeenCalled();
    //         expect(mailerService.sendConfirmationRegisterEmail)
    //             .toHaveBeenCalledTimes(1);
    //
    //     }
    // );

    it("POST '/api/auth/registration' - attempt to register via email (not successful)", async () => {
        expect(await dataQueryRepository.returnUsersAmount()).toBe(3);

        const newUserToRegisterViaEmail: RegistrationUserInputModel = {
            login: "hello_wr",
            email: "geniusb198@yandex.ru",
            password: "new_password",
        };

        const newUserToRegisterViaEmail1: RegistrationUserInputModel = {
            login: "hel_hel",
            email: "test_email@yandex.com",
            password: "new_password",
        };

        // попытка зарегистрироваться с уже имеющимся login
        const res = await request(testApp)
            .post(`${AUTH_PATH}/registration`)
            .send(newUserToRegisterViaEmail);

        // попытка зарегистрироваться с уже имеющимся email
        const res1 = await request(testApp)
            .post(`${AUTH_PATH}/registration`)
            .send(newUserToRegisterViaEmail1);

        // const mockedServiceCall = authService.registerNewUser;

        expect(res.status).toBe(HttpStatus.BadRequest);
        expect(res1.status).toBe(HttpStatus.BadRequest);
        // expect(mailerService.sendConfirmationRegisterEmail)
        // .toHaveBeenCalled();
        expect(
            mailerService.sendConfirmationRegisterEmail,
        ).toHaveBeenCalledTimes(0);
    });

    it("POST '/api/auth/registration-confirmation' - attempt to confirm registration by sending and accepting registration code (successful)", async () => {
        expect(await dataQueryRepository.returnUsersAmount()).toBe(3);

        const resentEmail: ResentRegistrationConfirmationInput = {
            email: "geniusb198@yandex.ru",
        };

        const res = await request(testApp)
            .post(`${AUTH_PATH}/registration-email-resending`)
            .send(resentEmail);

        expect(res.status).toBe(HttpStatus.NoContent);

        expect(mailerService.sendConfirmationRegisterEmail).toHaveBeenCalled();
        expect(
            mailerService.sendConfirmationRegisterEmail,
        ).toHaveBeenCalledTimes(1);
    });

    it("POST '/api/auth/registration-confirmation' - attempt to confirm registration by sending and accepting registration code (not successful, cuz incorrect email)", async () => {
        expect(await dataQueryRepository.returnUsersAmount()).toBe(3);

        const resentEmail: ResentRegistrationConfirmationInput = {
            email: "tesssst_email@yandex.com",
        };

        const res = await request(testApp)
            .post(`${AUTH_PATH}/registration-email-resending`)
            .send(resentEmail);

        expect(res.status).toBe(HttpStatus.BadRequest);

        expect(
            mailerService.sendConfirmationRegisterEmail,
        ).not.toHaveBeenCalled();
        // expect(mailerService.sendConfirmationRegisterEmail)
        //     .toHaveBeenCalledTimes(1);
    });

    it("POST '/api/auth/registration-email-resending' - attempt to resend registration code (successful)", async () => {
        expect(await dataQueryRepository.returnUsersAmount()).toBe(3);

        const newUserToRegisterViaEmail: RegistrationUserInputModel = {
            login: "another",
            email: "geniiusb198@yandex.ru",
            password: "new_password",
        };

        const codeConfirmation = { code: "1-2-3-4-5-6" };

        const registrationRes = await request(testApp)
            .post(`${AUTH_PATH}/registration`)
            .send(newUserToRegisterViaEmail);

        expect(registrationRes.status).toBe(HttpStatus.NoContent);
        expect(mailerService.sendConfirmationRegisterEmail).toHaveBeenCalled();
        expect(
            mailerService.sendConfirmationRegisterEmail,
        ).toHaveBeenCalledTimes(1);

        const confirmationRes = await request(testApp)
            .post(`${AUTH_PATH}/registration-confirmation`)
            .send(codeConfirmation);

        expect(confirmationRes.status).toBe(HttpStatus.NoContent);
        expect(UUIDgeneration.generateUUID).toHaveBeenCalled();
        expect(UUIDgeneration.generateUUID).toHaveBeenCalledTimes(1);
    });

    it("POST '/api/auth/registration-email-resending' - attempt to resend registration code (not successful)", async () => {
        expect(await dataQueryRepository.returnUsersAmount()).toBe(4);

        const newUserToRegisterViaEmail: RegistrationUserInputModel = {
            login: "a1other",
            email: "gentusb198@yandex.ru",
            password: "new_password",
        };

        // пробуем неверный код подтверждения передать. Правильный: "1-2-3-4-5-6"
        const wrongCodeConfirmation = { code: "2-2-3-4-5-6" };

        const registrationRes = await request(testApp)
            .post(`${AUTH_PATH}/registration`)
            .send(newUserToRegisterViaEmail);

        expect(registrationRes.status).toBe(HttpStatus.NoContent);
        expect(mailerService.sendConfirmationRegisterEmail).toHaveBeenCalled();
        expect(
            mailerService.sendConfirmationRegisterEmail,
        ).toHaveBeenCalledTimes(1);

        const confirmationRes = await request(testApp)
            .post(`${AUTH_PATH}/registration-confirmation`)
            .send(wrongCodeConfirmation);

        expect(confirmationRes.status).toBe(HttpStatus.BadRequest);
        expect(UUIDgeneration.generateUUID).toHaveBeenCalled();
        expect(UUIDgeneration.generateUUID).toHaveBeenCalledTimes(1);
    });

    //********************************************************************************

    it("POST '/api/auth/refresh-token' - attempt to refresh token (successful)", async () => {
        expect(await dataQueryRepository.returnUsersAmount()).toBe(5);

        // это существующие креды, создавали в первом it
        const loginData: LoginInputModel = {
            loginOrEmail: "hello_wr",
            password: "hello_world",
        };

        // Получаем текущие токены
        const loginRes = await request(testApp)
            .post(`${AUTH_PATH}/login`)
            .send(loginData);

        expect(loginRes.status).toBe(HttpStatus.Ok);
        expect(loginRes.body.accessToken).toBeDefined();
        expect(loginRes.header["set-cookie"]).toBeDefined();
        const setCookieValue = loginRes.header["set-cookie"];

        let refreshTokenCookie: string | undefined;

        if (Array.isArray(setCookieValue)) {
            refreshTokenCookie = setCookieValue.find((cookie) =>
                // имя куки refreshToken определено по ТЗ
                cookie.startsWith("refreshToken="),
            );
        } else if (typeof setCookieValue === "string") {
            refreshTokenCookie = setCookieValue.startsWith("refreshToken=")
                ? setCookieValue
                : undefined;
        }

        expect(refreshTokenCookie).toBeDefined();

        // ниже блок функции для извлечения значения куки
        const extractJwtFromCookie = (cookieString: string): string => {
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
        expect(refreshTokenValue).toMatch(
            /^[a-zA-Z0-9\-_]+\.[a-zA-Z0-9\-_]+\.[a-zA-Z0-9\-_]+$/,
        ); // проверка формата JWT

        console.log(refreshTokenCookie);

        //изобретаем задержку на 1 секунду
        const delay = (ms: number) =>
            new Promise((resolve) => setTimeout(resolve, ms));
        await delay(1000); // задержка 1 секунда
        console.log("Прошла 1 секунда");

        // Пытаемся обновить токены
        const refreshRes = await request(testApp)
            .post(`${AUTH_PATH}/refresh-token`)
            .set("Cookie", `refreshToken=${refreshTokenValue}`)
            .send();

        expect(refreshRes.status).toBe(HttpStatus.Ok);
        expect(refreshRes.body.accessToken).toBeDefined();
        expect(refreshRes.header["set-cookie"]).toBeDefined();
        const setNewCookieValue = refreshRes.header["set-cookie"];

        let refreshNewTokenCookie: string | undefined;

        if (Array.isArray(setNewCookieValue)) {
            refreshNewTokenCookie = setNewCookieValue.find((cookie) =>
                // имя куки refreshToken определено по ТЗ
                cookie.startsWith("refreshToken="),
            );
        } else if (typeof setNewCookieValue === "string") {
            refreshNewTokenCookie = setNewCookieValue.startsWith(
                "refreshToken=",
            )
                ? setCookieValue
                : undefined;
        }

        expect(refreshNewTokenCookie).toBeDefined();

        console.log(refreshNewTokenCookie);

        expect(refreshRes.body.accessToken).not.toEqual(
            loginRes.body.accessToken,
        );
        expect(refreshTokenCookie).not.toEqual(refreshNewTokenCookie);
    });

    it("POST '/api/auth/refresh-token' - attempt to refresh token with expired refresh token (not successful)", async () => {
        // Создаём expired JWT
        const expiredRefreshToken = jwt.sign(
            {
                userId_1,
                iat: Math.floor(Date.now() / 1000),
                exp: Math.floor(Date.now() / 1000 - 3600),
            },
            envConfig.refreshTokenSecret,
        );

        // Устанавливаем expired токен в куку
        const refreshRes = await request(testApp)
            .post(`${AUTH_PATH}/refresh-token`)
            .set("Cookie", `refreshToken=${expiredRefreshToken}`)
            .send();

        expect(refreshRes.status).toBe(HttpStatus.Unauthorized);
    });

    it("POST '/api/auth/refresh-token' - attempt to refresh token with malformed refresh token (not successful)", async () => {
        const malformedRefreshToken = "invalid_token_format";

        const refreshRes = await request(testApp)
            .post(`${AUTH_PATH}/refresh-token`)
            .set("Cookie", `refreshToken=${malformedRefreshToken}`)
            .send();

        expect(refreshRes.status).toBe(HttpStatus.Unauthorized);
    });

    it("POST '/api/auth/logout' - attempt to logout (successful)", async () => {
        expect(await dataQueryRepository.returnUsersAmount()).toBe(5);

        const loginData: LoginInputModel = {
            loginOrEmail: "hello_w2",
            password: "hello_world",
        };

        // Логинимся, чтобы получить refresh token в куках
        const loginRes = await request(testApp)
            .post(`${AUTH_PATH}/login`)
            .send(loginData);

        expect(loginRes.status).toBe(HttpStatus.Ok);
        expect(loginRes.header["set-cookie"]).toBeDefined();

        // Извлекаем refresh token из кук
        const setCookieValue = loginRes.header["set-cookie"];
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

        const refreshTokenValue = extractJwtFromCookie(refreshTokenCookie);
        expect(refreshTokenValue).toMatch(
            /^[a-zA-Z0-9\-_]+\.[a-zA-Z0-9\-_]+\.[a-zA-Z0-9\-_]+$/,
        );

        // Выполняем logout, передавая refresh token в куках
        const logoutRes = await request(testApp)
            .post(`${AUTH_PATH}/logout`)
            .set("Cookie", `refreshToken=${refreshTokenValue}`)
            .send();

        expect(logoutRes.status).toBe(HttpStatus.NoContent);

        // Проверяем, что refresh token больше не действителен
        const refreshResAfterLogout = await request(testApp)
            .post(`${AUTH_PATH}/refresh-token`)
            .set("Cookie", `refreshToken=${refreshTokenValue}`)
            .send();

        expect(refreshResAfterLogout.status).toBe(HttpStatus.Unauthorized);
    });

    it("POST '/api/auth/logout' - attempt to logout with invalid refresh token (not successful)", async () => {
        const invalidRefreshToken = "invalid_refresh_token";

        const logoutRes = await request(testApp)
            .post(`${AUTH_PATH}/logout`)
            .set("Cookie", `refreshToken=${invalidRefreshToken}`)
            .send();

        expect(logoutRes.status).toBe(HttpStatus.Unauthorized);
    });

    it("POST '/api/auth/logout' - attempt to logout without refresh token (not successful)", async () => {
        const logoutRes = await request(testApp)
            .post(`${AUTH_PATH}/logout`)
            .send(); // без кук

        expect(logoutRes.status).toBe(HttpStatus.Unauthorized);
    });



});
