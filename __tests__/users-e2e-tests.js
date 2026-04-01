"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const express = __importStar(require("express"));
const setup_app_1 = require("../src/setup-app");
const mongo_db_1 = require("../src/db/mongo.db");
const request = __importStar(require("supertest"));
const router_pathes_1 = require("../src/routers/pathes/router-pathes");
const command_repository_1 = require("../src/repository-layers/command-repository-layer/command-repository");
const http_statuses_1 = require("../src/common/http-statuses/http-statuses");
const users_query_repository_1 = require("../src/repository-layers/query-repository-layer/users-query-repository");
describe("Test API for managing users ", () => {
    const testApp = express();
    (0, setup_app_1.setupApp)(testApp);
    beforeAll(() => __awaiter(void 0, void 0, void 0, function* () {
        yield (0, mongo_db_1.runDB)();
        const res = yield request(testApp)
            .delete(`${router_pathes_1.TESTING_PATH}/all-data`);
        expect(res.status)
            .toBe(204);
    }));
    afterAll(() => __awaiter(void 0, void 0, void 0, function* () {
        const res = yield request(testApp)
            .delete(`${router_pathes_1.TESTING_PATH}/all-data`);
        expect(res.status)
            .toBe(204);
        // Закрываем после всех тестов
        yield (0, mongo_db_1.closeDB)();
    }));
    let userId_1 = "";
    let userId_2 = "";
    let userId_3 = "";
    let userId_4 = "";
    let userId_5 = "";
    it("Creating test user entries, directly without endpoint calls", () => __awaiter(void 0, void 0, void 0, function* () {
        const newUser_1 = {
            login: "hello_world",
            password: "hello_world",
            email: "test_email@yandex.com"
        };
        userId_1 = yield command_repository_1.dataCommandRepository.createNewUser(newUser_1);
        const newUser_2 = {
            login: "hello_world_2",
            password: "hello_world",
            email: "test_email_2@yandex.com"
        };
        userId_2 = yield command_repository_1.dataCommandRepository.createNewUser(newUser_2);
        const newUser_3 = {
            login: "hello_world_3",
            password: "hello_world",
            email: "test_email_3@yandex.com"
        };
        userId_3 = yield command_repository_1.dataCommandRepository.createNewUser(newUser_3);
        const newUser_4 = {
            login: "hello_world_4",
            password: "hello_world",
            email: "test_email_4@yandex.com"
        };
        userId_4 = yield command_repository_1.dataCommandRepository.createNewUser(newUser_4);
    }));
    it("GET '/api/users/' - checking simple get-response with empty query params request - should respond with a list of users (4 user entries total)", () => __awaiter(void 0, void 0, void 0, function* () {
        expect(yield users_query_repository_1.UsersQueryRepository.returnUsersAmount())
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
        const res = yield request(testApp)
            .get(`${router_pathes_1.USERS_PATH}/`)
            .set("Authorization", "Basic " + "YWRtaW46cXdlcnR5");
        expect(res.status)
            .toBe(http_statuses_1.HttpStatus.Ok);
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
    }));
    it("GET '/api/users/' - checking get-response with custom query params request - should respond with a list of users (total 3 user entries, 2 entries per page, 2 pages total)", () => __awaiter(void 0, void 0, void 0, function* () {
        expect(yield users_query_repository_1.UsersQueryRepository.returnUsersAmount())
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
        const res = yield request(testApp)
            .get(`${router_pathes_1.USERS_PATH}/`)
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
            .toBe(http_statuses_1.HttpStatus.Ok);
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
            .toHaveProperty("email", "test_email_2@yandex.com");
        expect(res.body.items[0])
            .toHaveProperty("createdAt");
        // console.log(JSON.stringify(res.body));
    }));
    it("GET '/api/users/' - checking get-response with custom query params request with errors (wrong value in field sortBy) - should respond with error 400", () => __awaiter(void 0, void 0, void 0, function* () {
        expect(yield users_query_repository_1.UsersQueryRepository.returnUsersAmount())
            .toBe(4);
        const res = yield request(testApp)
            .get(`${router_pathes_1.USERS_PATH}/`)
            .query({
            // incorrect value
            sortBy: "blogId"
        })
            .set("Authorization", "Basic " + "YWRtaW46cXdlcnR5");
        expect(res.status)
            .toBe(http_statuses_1.HttpStatus.BadRequest);
        // console.log(JSON.stringify(res.body));
    }));
    it("GET '/api/users/' - checking get-response with wrong credentials - should respond with error 401", () => __awaiter(void 0, void 0, void 0, function* () {
        expect(yield users_query_repository_1.UsersQueryRepository.returnUsersAmount())
            .toBe(4);
        const res = yield request(testApp)
            .get(`${router_pathes_1.USERS_PATH}/`);
        expect(res.status)
            .toBe(http_statuses_1.HttpStatus.Unauthorized);
        // console.log(JSON.stringify(res.body));
    }));
    it("POST '/api/users/' - should add a user entry to the repository", () => __awaiter(void 0, void 0, void 0, function* () {
        const newUser_5 = {
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
        const res = yield request(testApp)
            .post(`${router_pathes_1.USERS_PATH}/`)
            .send(newUser_5)
            .set("Authorization", "Basic " + "YWRtaW46cXdlcnR5");
        userId_5 = res.body.id;
        expect(res.status)
            .toBe(http_statuses_1.HttpStatus.Created);
        // console.log(JSON.stringify(res.body));
    }));
    it("POST '/api/users/' - shouldn't add a user to the repository because of too long login (Error 400)", () => __awaiter(void 0, void 0, void 0, function* () {
        const newUser_5 = {
            login: "test_new_user",
            password: "hello_world",
            email: "test_new_email@yandex.com"
        };
        // const userId_5 = await dataCommandRepository.createNewUser(newUser_5);
        const res = yield request(testApp)
            .post(`${router_pathes_1.USERS_PATH}/`)
            .send(newUser_5)
            .set("Authorization", "Basic " + "YWRtaW46cXdlcnR5");
        expect(res.status)
            .toBe(http_statuses_1.HttpStatus.BadRequest);
        // console.log(JSON.stringify(res.body));
    }));
    it("POST '/api/users/' - shouldn't add neither of the users to the repository because of the duplicated fields (Error 400)", () => __awaiter(void 0, void 0, void 0, function* () {
        const newUser_5 = {
            login: "new_user",
            password: "hello_world",
            email: "testNN_email@yandex.com"
        };
        const newUser_6 = {
            login: "newNN_user",
            password: "hello_world",
            email: "test_new_email@yandex.com"
        };
        const res = yield request(testApp)
            .post(`${router_pathes_1.USERS_PATH}/`)
            .send(newUser_5)
            .set("Authorization", "Basic " + "YWRtaW46cXdlcnR5");
        expect(res.status)
            .toBe(http_statuses_1.HttpStatus.BadRequest);
        const anotherRes = yield request(testApp)
            .post(`${router_pathes_1.USERS_PATH}/`)
            .send(newUser_6)
            .set("Authorization", "Basic " + "YWRtaW46cXdlcnR5");
        expect(anotherRes.status)
            .toBe(http_statuses_1.HttpStatus.BadRequest);
        // console.log(JSON.stringify(res.body));
    }));
    it("DELETE '/api/users/{id}' - shouldn't be able to delete a user because of incorrect login/password pair (Error - Unauthorized 401)", () => __awaiter(void 0, void 0, void 0, function* () {
        expect(yield users_query_repository_1.UsersQueryRepository.returnUsersAmount())
            .toBe(5);
        const res = yield request(testApp)
            .delete(`${router_pathes_1.USERS_PATH}/${userId_5}`)
            .set("Authorization", "Basic " + "111111");
        expect(res.status)
            .toBe(http_statuses_1.HttpStatus.Unauthorized);
        expect(yield users_query_repository_1.UsersQueryRepository.returnUsersAmount())
            .toBe(5);
        const anotherRes = yield request(testApp)
            .delete(`${router_pathes_1.USERS_PATH}/${userId_5}`)
            .set("Authorization", "111111 " + "YWRtaW46cXdlcnR5");
        expect(anotherRes.status)
            .toBe(http_statuses_1.HttpStatus.Unauthorized);
        expect(yield users_query_repository_1.UsersQueryRepository.returnUsersAmount())
            .toBe(5);
    }));
    it("DELETE '/api/users/{id}' - shouldn't be able to delete a user entry because of incorrect ID (Error - Not found 404)", () => __awaiter(void 0, void 0, void 0, function* () {
        expect(yield users_query_repository_1.UsersQueryRepository.returnUsersAmount())
            .toBe(5);
        const res = yield request(testApp)
            .delete(`${router_pathes_1.USERS_PATH}/696e5b3ecb6c68a44acf704a`)
            .set("Authorization", "Basic " + "YWRtaW46cXdlcnR5");
        expect(res.status)
            .toBe(http_statuses_1.HttpStatus.NotFound);
        expect(yield users_query_repository_1.UsersQueryRepository.returnUsersAmount())
            .toBe(5);
    }));
    it("DELETE '/api/users/{id}' - should correctly delete a user entry", () => __awaiter(void 0, void 0, void 0, function* () {
        expect(yield users_query_repository_1.UsersQueryRepository.returnUsersAmount())
            .toBe(5);
        const res = yield request(testApp)
            .delete(`${router_pathes_1.USERS_PATH}/${userId_5}`)
            .set("Authorization", "Basic " + "YWRtaW46cXdlcnR5");
        expect(res.status)
            .toBe(http_statuses_1.HttpStatus.NoContent);
        expect(yield users_query_repository_1.UsersQueryRepository.returnUsersAmount())
            .toBe(4);
    }));
});
function expect(status) {
    throw new Error("Function not implemented.");
}
