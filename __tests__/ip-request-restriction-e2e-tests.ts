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
import { RegistrationConfirmationInput } from "../src/routers/router-types/auth-registration-confirmation-input-model";

describe("Test IP request restriction system", () => {
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
            "sendEmailWithCode",
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
    }, 10000);

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

    it("POST '/api/auth/registration' - attempt to register via email (5 attempts successful, then 1 with 429 error, then wait 5 sec, then last one successful attempt)", async () => {
        expect(await dataQueryRepository.returnUsersAmount()).toBe(2);

        const arrayOfUserRegistrationData: RegistrationUserInputModel[] = [
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
        const delay = (ms: number) =>
            new Promise((resolve) => setTimeout(resolve, ms));

        const numberOfTries = 5;
        for (let i = 0; i < numberOfTries; i++) {
            const res = await request(testApp)
                .post(`${AUTH_PATH}/registration`)
                .set("User-Agent", "CustomUserAgentHeader/1.0")
                .send(arrayOfUserRegistrationData[i]);

            expect(res.status).toBe(HttpStatus.NoContent);
            expect(
                mailerService.sendEmailWithCode,
            ).toHaveBeenCalled();

            await delay(1000); // задержка 1 секунда
            console.log("COUNT TRIES: ", i + 1);
        }

        expect(
            mailerService.sendEmailWithCode,
        ).toHaveBeenCalledTimes(5);

        const restrictedSessionsList =
            await dataQueryRepository.utilGetAllRestrictedSessionRecords();
        console.log("RESTRICTED SESSION STORAGE 1: ", restrictedSessionsList);

        const res = await request(testApp)
            .post(`${AUTH_PATH}/registration`)
            .set("User-Agent", "CustomUserAgentHeader/1.0")
            .send(arrayOfUserRegistrationData[5]);

        expect(res.status).toBe(HttpStatus.TooManyRequests);
        expect(mailerService.sendEmailWithCode).toHaveBeenCalled();

        const res1 = await request(testApp)
            .post(`${AUTH_PATH}/registration`)
            .set("User-Agent", "CustomUserAgentHeader/1.0")
            .send(arrayOfUserRegistrationData[5]);

        expect(res1.status).toBe(HttpStatus.TooManyRequests);
        expect(mailerService.sendEmailWithCode).toHaveBeenCalled();

        await delay(5000); // задержка 5 секунд

        const res2 = await request(testApp)
            .post(`${AUTH_PATH}/registration`)
            .set("User-Agent", "CustomUserAgentHeader/1.0")
            .send(arrayOfUserRegistrationData[5]);

        expect(res2.status).toBe(HttpStatus.NoContent);
        expect(mailerService.sendEmailWithCode).toHaveBeenCalled();

        const restrictedSessionsList1 =
            await dataQueryRepository.utilGetAllRestrictedSessionRecords();
        console.log("RESTRICTED SESSION STORAGE 2: ", restrictedSessionsList1);
    }, 25000);

    it("POST '/api/auth/registration-confirmation' - attempt to confirm registration by sending and accepting registration code (5 attempts successful, then 1 with 429 error, then wait 5 sec, then last one successful attempt) ", async () => {
        const registrationCode: RegistrationConfirmationInput = {
            code: "1-2-3-4-5-6",
        };

        //изобретаем задержку на 1 секунду
        const delay = (ms: number) =>
            new Promise((resolve) => setTimeout(resolve, ms));

        const numberOfTries = 5;
        for (let i = 0; i < numberOfTries; i++) {
            const res = await request(testApp)
                .post(`${AUTH_PATH}/registration-confirmation`)
                .send(registrationCode);

            expect(res.status).toBe(HttpStatus.NoContent);

            await delay(1000); // задержка 1 секунда
            console.log("COUNT TRIES: ", i + 1);
        }

        // шестой вызов внутри 10-ти секундного интервала, должен будет вернуть ошибку
        const res1 = await request(testApp)
            .post(`${AUTH_PATH}/registration-confirmation`)
            .send(registrationCode);

        expect(res1.status).toBe(HttpStatus.TooManyRequests);

        await delay(5000); // задержка 5 секунд, чтобы перешагнуть 10-ти секундный барьер, после которого можно снова пробовать отсылать

        const res2 = await request(testApp)
            .post(`${AUTH_PATH}/registration-confirmation`)
            .send(registrationCode);

        expect(res2.status).toBe(HttpStatus.NoContent);
    }, 25000);


    it("POST '/api/auth/registration-email-resending' - attempt to resend registration code (successful)", async () => {

        const newUserRegistrationData: RegistrationUserInputModel = {
            login: "new_login8",
            email: "geniusb8@yandex.ru",
            password: "new_password",
        };

        // создаем еще один тестовый аккаунт, на который будем отправлять емейл с кодами подтверждения
        const resAdditinalLogin = await request(testApp)
            .post(`${AUTH_PATH}/registration`)
            .set("User-Agent", "CustomUserAgentHeader/7.0")
            .send(newUserRegistrationData);

        expect(resAdditinalLogin.status).toBe(HttpStatus.NoContent);
        expect(mailerService.sendEmailWithCode).toHaveBeenCalled();

        const emailToResendRegistration: ResentRegistrationConfirmationInput = {
            email: "geniusb8@yandex.ru",
        };

        //изобретаем задержку на 1 секунду
        const delay = (ms: number) =>
            new Promise((resolve) => setTimeout(resolve, ms));

        const numberOfTries = 5;
        for (let i = 0; i < numberOfTries; i++) {
            const res = await request(testApp)
                .post(`${AUTH_PATH}/registration-email-resending`)
                .send(emailToResendRegistration);

            expect(res.status).toBe(HttpStatus.NoContent);
            expect(
                mailerService.sendEmailWithCode,
            ).toHaveBeenCalled();

            await delay(1000); // задержка 1 секунда
            console.log("COUNT TRIES: ", i + 1);
        }

        expect(
            mailerService.sendEmailWithCode,
        ).toHaveBeenCalledTimes(6);

        // шестой вызов внутри 10-ти секундного интервала, должен будет вернуть ошибку
        const res1 = await request(testApp)
            .post(`${AUTH_PATH}/registration-email-resending`)
            .send(emailToResendRegistration);

        expect(res1.status).toBe(HttpStatus.TooManyRequests);
        expect(mailerService.sendEmailWithCode).toHaveBeenCalled();

        await delay(5000); // задержка 5 секунд, чтобы перешагнуть 10-ти секундный барьер, после которого можно снова пробовать отсылать

        // еще раз пробуем, после того как перешагнули порог 10-ти секунд
        const res2 = await request(testApp)
            .post(`${AUTH_PATH}/registration-email-resending`)
            .send(emailToResendRegistration);

        expect(res2.status).toBe(HttpStatus.NoContent);
        expect(mailerService.sendEmailWithCode).toHaveBeenCalled();

    }, 25000);
});
