import express from "express";
import { setupApp } from "../src/setup-app";
import { closeDB, runDB } from "../src/db/mongo.db";
import request from "supertest";
import { TESTING_PATH, USERS_PATH } from "../src/routers/pathes/router-pathes";
import { UserInputModel } from "../src/routers/router-types/user-input-model";
import { dataCommandRepository } from "../src/repository-layers/command-repository-layer/command-repository";
import { dataQueryRepository } from "../src/repository-layers/query-repository-layer/query-repository";
import { HttpStatus } from "../src/common/http-statuses/http-statuses";
import { UsersQueryRepository } from "../src/repository-layers/query-repository-layer/users-query-repository";


describe("Test API for managing users ", () => {
    const testApp = express();
    setupApp(testApp);

    beforeAll(async () => {
        await runDB();

        const res = await request(testApp)
            .delete(`${TESTING_PATH}/all-data`);
        expect(res.status)
            .toBe(204);
    });

    afterAll(async () => {
        const res = await request(testApp)
            .delete(`${TESTING_PATH}/all-data`);

        expect(res.status)
            .toBe(204);

        // Закрываем после всех тестов
        await closeDB();
    });

    let userId_1: string | undefined = "";
    let userId_2: string | undefined = "";
    let userId_3: string | undefined = "";
    let userId_4: string | undefined = "";
    let userId_5: string | undefined = "";

    it("Creating test user entries, directly without endpoint calls", async () => {
        const newUser_1: UserInputModel = {
            login: "hello_world",
            password: "hello_world",
            email: "test_email@yandex.com"
        };
        userId_1 = await dataCommandRepository.createNewUser(newUser_1);

        const newUser_2: UserInputModel = {
            login: "hello_world_2",
            password: "hello_world",
            email: "test_email_2@yandex.com"
        };
        userId_2 = await dataCommandRepository.createNewUser(newUser_2);

        const newUser_3: UserInputModel = {
            login: "hello_world_3",
            password: "hello_world",
            email: "test_email_3@yandex.com"
        };
        userId_3 = await dataCommandRepository.createNewUser(newUser_3);

        const newUser_4: UserInputModel = {
            login: "hello_world_4",
            password: "hello_world",
            email: "test_email_4@yandex.com"
        };
        userId_4 = await dataCommandRepository.createNewUser(newUser_4);
    });

    it("GET '/api/users/' - checking simple get-response with empty query params request - should respond with a list of users (4 user entries total)",
        async () => {
            expect(await UsersQueryRepository.returnUsersAmount())
                .toBe(4);

            // {
            //     "pagesCount": 1,
            //     "page": 1,
            //     "pageSize": 10,
            //     "totalCount": 4,
            //     "items": [
            //     {
            //         "id": "696e3fd771e6239b2ed18251",
            //         "login": "hello_world_4",
            //         "email": "test_email_4@yandex.com",
            //         "createdAt": "2026-01-19T14:29:43.811Z"
            //     },
            //     {
            //         "id": "696e3fd771e6239b2ed18250",
            //         "login": "hello_world_3",
            //         "email": "test_email_3@yandex.com",
            //         "createdAt": "2026-01-19T14:29:43.501Z"
            //     },
            //     {
            //         "id": "696e3fd771e6239b2ed1824f",
            //         "login": "hello_world_2",
            //         "email": "test_email_2@yandex.com",
            //         "createdAt": "2026-01-19T14:29:43.296Z"
            //     },
            //     {
            //         "id": "696e3fd671e6239b2ed1824e",
            //         "login": "hello_world",
            //         "email": "test_email@yandex.com",
            //         "createdAt": "2026-01-19T14:29:42.998Z"
            //     }
            // ]
            // }

            const res = await request(testApp)
                .get(`${USERS_PATH}/`)
                .set("Authorization", "Basic " + "YWRtaW46cXdlcnR5");

            expect(res.status)
                .toBe(HttpStatus.Ok);

            const propertyCount = Object.keys(res.body).length;
            expect(propertyCount)
                .toBe(5);

            expect(res.body.pagesCount)
                .toBeDefined();
            expect(res.body.page)
                .toBeDefined();
            expect(res.body.pageSize)
                .toBeDefined();
            expect(res.body.totalCount)
                .toBeDefined();
            expect(res.body.items)
                .toBeDefined();

            expect(res.body)
                .toHaveProperty("pagesCount", 1);
            expect(res.body)
                .toHaveProperty("page", 1);
            expect(res.body)
                .toHaveProperty("pageSize", 10);
            expect(res.body)
                .toHaveProperty("totalCount", 4);
            expect(res.body)
                .toHaveProperty("items");
            expect(Array.isArray(res.body.items))
                .toBe(true);

            expect(res.body.items[0])
                .toHaveProperty("id");
            expect(res.body.items[0])
                .toHaveProperty("login");
            expect(res.body.items[0])
                .toHaveProperty("email");
            expect(res.body.items[0])
                .toHaveProperty("createdAt");

            // console.log(JSON.stringify(res.body));
        });

    it("GET '/api/users/' - checking get-response with custom query params request - should respond with a list of users (total 3 user entries, 2 entries per page, 2 pages total)",
        async () => {
            expect(await UsersQueryRepository.returnUsersAmount())
                .toBe(4);

            // {
            //     "pagesCount": 2,
            //     "page": 1,
            //     "pageSize": 2,
            //     "totalCount": 3,
            //     "items": [
            //     {
            //         "id": "696e49a7876e2c5951f8c166",
            //         "login": "hello_world_2",
            //         "email": "test_email_2@yandex.com",
            //         "createdAt": "2026-01-19T15:11:35.508Z"
            //     },
            //     {
            //         "id": "696e49a7876e2c5951f8c167",
            //         "login": "hello_world_3",
            //         "email": "test_email_3@yandex.com",
            //         "createdAt": "2026-01-19T15:11:35.745Z"
            //     }
            // ]
            // }

            const res = await request(testApp)
                .get(`${USERS_PATH}/`)
                .query({
                    pageNumber: 1,
                    sortDirection: "asc",
                    sortBy: "login",
                    pageSize: 2,
                    searchEmailTerm: "email_",
                    searchLoginTerm: "world_3"
                })
                .set("Authorization", "Basic " + "YWRtaW46cXdlcnR5");

            expect(res.status)
                .toBe(HttpStatus.Ok);

            const propertyCount = Object.keys(res.body).length;
            expect(propertyCount)
                .toBe(5);

            expect(res.body.pagesCount)
                .toBeDefined();
            expect(res.body.page)
                .toBeDefined();
            expect(res.body.pageSize)
                .toBeDefined();
            expect(res.body.totalCount)
                .toBeDefined();
            expect(res.body.items)
                .toBeDefined();

            expect(res.body)
                .toHaveProperty("pagesCount", 2);
            expect(res.body)
                .toHaveProperty("page", 1);
            expect(res.body)
                .toHaveProperty("pageSize", 2);
            expect(res.body)
                .toHaveProperty("totalCount", 3);
            expect(res.body)
                .toHaveProperty("items");
            expect(Array.isArray(res.body.items))
                .toBe(true);

            expect(res.body.items[0])
                .toHaveProperty("id");
            expect(res.body.items[0])
                .toHaveProperty("login", "hello_world_2");
            expect(res.body.items[0])
                .toHaveProperty(
                    "email",
                    "test_email_2@yandex.com"
                );
            expect(res.body.items[0])
                .toHaveProperty("createdAt");

            // console.log(JSON.stringify(res.body));
        });

    it("GET '/api/users/' - checking get-response with custom query params request with errors (wrong value in field sortBy) - should respond with error 400",
        async () => {
            expect(await UsersQueryRepository.returnUsersAmount())
                .toBe(4);

            const res = await request(testApp)
                .get(`${USERS_PATH}/`)
                .query({
                    // incorrect value
                    sortBy: "blogId"
                })
                .set("Authorization", "Basic " + "YWRtaW46cXdlcnR5");

            expect(res.status)
                .toBe(HttpStatus.BadRequest);

            // console.log(JSON.stringify(res.body));
        });

    it("GET '/api/users/' - checking get-response with wrong credentials - should respond with error 401", async () => {
        expect(await UsersQueryRepository.returnUsersAmount())
            .toBe(4);

        const res = await request(testApp)
            .get(`${USERS_PATH}/`);

        expect(res.status)
            .toBe(HttpStatus.Unauthorized);

        // console.log(JSON.stringify(res.body));
    });

    it("POST '/api/users/' - should add a user entry to the repository", async () => {
        const newUser_5: UserInputModel = {
            login: "new_user",
            password: "hello_world",
            email: "test_new_email@yandex.com"
        };

        // {
        //     "id": "696e5b3ecb6c68a44acf704a",
        //     "login": "new_user",
        //     "email": "test_new_email@yandex.com",
        //     "createdAt": "2026-01-19T16:26:38.984Z"
        // }

        const res = await request(testApp)
            .post(`${USERS_PATH}/`)
            .send(newUser_5)
            .set("Authorization", "Basic " + "YWRtaW46cXdlcnR5");

        userId_5 = res.body.id;

        expect(res.status)
            .toBe(HttpStatus.Created);

        // console.log(JSON.stringify(res.body));
    });

    it("POST '/api/users/' - shouldn't add a user to the repository because of too long login (Error 400)",
        async () => {
            const newUser_5: UserInputModel = {
                login: "test_new_user",
                password: "hello_world",
                email: "test_new_email@yandex.com"
            };
            // const userId_5 = await dataCommandRepository.createNewUser(newUser_5);

            const res = await request(testApp)
                .post(`${USERS_PATH}/`)
                .send(newUser_5)
                .set("Authorization", "Basic " + "YWRtaW46cXdlcnR5");

            expect(res.status)
                .toBe(HttpStatus.BadRequest);

            // console.log(JSON.stringify(res.body));
        });

    it("POST '/api/users/' - shouldn't add neither of the users to the repository because of the duplicated fields (Error 400)",
        async () => {
            const newUser_5: UserInputModel = {
                login: "new_user",
                password: "hello_world",
                email: "testNN_email@yandex.com"
            };

            const newUser_6: UserInputModel = {
                login: "newNN_user",
                password: "hello_world",
                email: "test_new_email@yandex.com"
            };

            const res = await request(testApp)
                .post(`${USERS_PATH}/`)
                .send(newUser_5)
                .set("Authorization", "Basic " + "YWRtaW46cXdlcnR5");

            expect(res.status)
                .toBe(HttpStatus.BadRequest);

            const anotherRes = await request(testApp)
                .post(`${USERS_PATH}/`)
                .send(newUser_6)
                .set("Authorization", "Basic " + "YWRtaW46cXdlcnR5");

            expect(anotherRes.status)
                .toBe(HttpStatus.BadRequest);

            // console.log(JSON.stringify(res.body));
        });

    it("DELETE '/api/users/{id}' - shouldn't be able to delete a user because of incorrect login/password pair (Error - Unauthorized 401)",
        async () => {
            expect(await UsersQueryRepository.returnUsersAmount())
                .toBe(5);

            const res = await request(testApp)
                .delete(`${USERS_PATH}/${userId_5}`)
                .set("Authorization", "Basic " + "111111");
            expect(res.status)
                .toBe(HttpStatus.Unauthorized);

            expect(await UsersQueryRepository.returnUsersAmount())
                .toBe(5);

            const anotherRes = await request(testApp)
                .delete(`${USERS_PATH}/${userId_5}`)
                .set("Authorization", "111111 " + "YWRtaW46cXdlcnR5");
            expect(anotherRes.status)
                .toBe(HttpStatus.Unauthorized);

            expect(await UsersQueryRepository.returnUsersAmount())
                .toBe(5);
        });

    it("DELETE '/api/users/{id}' - shouldn't be able to delete a user entry because of incorrect ID (Error - Not found 404)",
        async () => {
            expect(await UsersQueryRepository.returnUsersAmount())
                .toBe(5);

            const res = await request(testApp)
                .delete(`${USERS_PATH}/696e5b3ecb6c68a44acf704a`)
                .set("Authorization", "Basic " + "YWRtaW46cXdlcnR5");
            expect(res.status)
                .toBe(HttpStatus.NotFound);

            expect(await UsersQueryRepository.returnUsersAmount())
                .toBe(5);
        });

    it("DELETE '/api/users/{id}' - should correctly delete a user entry", async () => {
        expect(await UsersQueryRepository.returnUsersAmount())
            .toBe(5);

        const res = await request(testApp)
            .delete(`${USERS_PATH}/${userId_5}`)
            .set("Authorization", "Basic " + "YWRtaW46cXdlcnR5");
        expect(res.status)
            .toBe(HttpStatus.NoContent);

        expect(await UsersQueryRepository.returnUsersAmount())
            .toBe(4);
    });
});
