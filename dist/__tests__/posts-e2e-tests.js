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
const setup_app_1 = require("../src/setup-app");
const supertest_1 = __importDefault(require("supertest"));
const mongo_db_1 = require("../src/db/mongo.db");
const http_statuses_1 = require("../src/common/http-statuses/http-statuses");
const router_pathes_1 = require("../src/routers/pathes/router-pathes");
const command_repository_1 = require("../src/repository-layers/command-repository-layer/command-repository");
const query_repository_1 = require("../src/repository-layers/query-repository-layer/query-repository");
describe("Test API for managing posts", () => {
    const testApp = (0, express_1.default)();
    (0, setup_app_1.setupApp)(testApp);
    beforeAll(() => __awaiter(void 0, void 0, void 0, function* () {
        yield (0, mongo_db_1.runDB)();
        // Почему тут это не нужно?
        // testApp.listen(3003, () => {
        //     console.log(`Server started on port 3003`);
        // });
        const res = yield (0, supertest_1.default)(testApp).delete(`${router_pathes_1.TESTING_PATH}/all-data`);
        expect(res.status).toBe(204);
    }));
    afterAll(() => __awaiter(void 0, void 0, void 0, function* () {
        const res = yield (0, supertest_1.default)(testApp).delete(`${router_pathes_1.TESTING_PATH}/all-data`);
        expect(res.status).toBe(204);
        // Закрываем после всех тестов
        yield (0, mongo_db_1.closeDB)();
    }));
    it("", () => __awaiter(void 0, void 0, void 0, function* () {
        const res = yield (0, supertest_1.default)(testApp).delete(`${router_pathes_1.TESTING_PATH}/all-data`);
        expect(res.status).toBe(204);
    }));
    let blogId_1 = "";
    let blogId_2 = "";
    let postId_1 = "";
    let postId_2 = "";
    let postId_3 = "";
    let postId_4 = "";
    it("Creating test base entries, directly without endpoint calls", () => __awaiter(void 0, void 0, void 0, function* () {
        const newBlog_1 = {
            name: "blogger_001",
            description: "takoy sebe blogger...",
            websiteUrl: "https://takoy.blogger.com",
        };
        blogId_1 = yield command_repository_1.dataCommandRepository.createNewBlog(newBlog_1);
        if (blogId_1) {
            const newPost_1 = {
                title: "post blog 001",
                shortDescription: "post ni o 4em",
                content: "Eto testovoe napolnenie posta 001_001",
                blogId: blogId_1,
            };
            const insertedPost_1 = yield command_repository_1.dataCommandRepository.createNewPost(newPost_1);
            if (!insertedPost_1) {
                throw new Error("Failed to createNewPost, returned undefined...");
            }
            const newPost_2 = {
                title: "post blog 002",
                shortDescription: "post ni o 4em",
                content: "Eto testovoe napolnenie posta 001_002",
                blogId: blogId_1,
            };
            const insertedPost_2 = yield command_repository_1.dataCommandRepository.createNewPost(newPost_2);
            if (!insertedPost_2) {
                throw new Error("Failed to createNewPost, returned undefined...");
            }
        }
        else {
            throw new Error("Could not create new blog - newBlog_1");
        }
        const newBlog_2 = {
            name: "blogger_002",
            description: "a eto klassnii blogger!",
            websiteUrl: "https://klassnii.blogger.com",
        };
        blogId_2 = yield command_repository_1.dataCommandRepository.createNewBlog(newBlog_2);
        if (blogId_2) {
            const newPost_3 = {
                title: "post blog 001",
                shortDescription: "horowii post",
                content: "Eto testovoe napolnenie posta 002_001",
                blogId: blogId_2,
            };
            postId_3 = yield command_repository_1.dataCommandRepository.createNewPost(newPost_3);
            if (!postId_3) {
                throw new Error("Failed to createNewPost, returned undefined...");
            }
            const newPost_4 = {
                title: "post blog 002",
                shortDescription: "horowii post",
                content: "Eto testovoe napolnenie posta 002_002",
                blogId: blogId_2,
            };
            const insertedPost_4 = yield command_repository_1.dataCommandRepository.createNewPost(newPost_4);
            if (!insertedPost_4) {
                throw new Error("Failed to createNewPost, returned undefined...");
            }
        }
    }));
    it("GET '/api/posts/' - checking response with empty query params request - should respond with a list of posts (4 post entries total)", () => __awaiter(void 0, void 0, void 0, function* () {
        expect(yield query_repository_1.dataQueryRepository.returnBloggersAmount()).toBe(2);
        const res = yield (0, supertest_1.default)(testApp).get(`${router_pathes_1.POSTS_PATH}/`);
        // {
        //     "pagesCount" : 1,
        //     "page" : 1,
        //     "pageSize" : 10,
        //     "totalCount" : 4,
        //     "items" : [{
        //         "id" : "69456df44964d096c2cbfc2c",
        //         "title" : "post blog 002",
        //         "shortDescription" : "horowii post",
        //         "content" : "Eto testovoe napolnenie posta 002_002",
        //         "blogId" : "69456df34964d096c2cbfc2a",
        //         "blogName" : "blogger_002",
        //         "createdAt" : "2025-12-19T15:23:33.091Z"
        //     }, {
        //         "id" : "69456df44964d096c2cbfc2b",
        //         "title" : "post blog 001",
        //         "shortDescription" : "horowii post",
        //         "content" : "Eto testovoe napolnenie posta 002_001",
        //         "blogId" : "69456df34964d096c2cbfc2a",
        //         "blogName" : "blogger_002",
        //         "createdAt" : "2025-12-19T15:23:32.664Z"
        //     }, {
        //         "id" : "69456df34964d096c2cbfc29",
        //         "title" : "post blog 002",
        //         "shortDescription" : "post ni o 4em",
        //         "content" : "Eto testovoe napolnenie posta 001_002",
        //         "blogId" : "69456df24964d096c2cbfc27",
        //         "blogName" : "blogger_001",
        //         "createdAt" : "2025-12-19T15:23:31.694Z"
        //     }, {
        //         "id" : "69456df24964d096c2cbfc28",
        //         "title" : "post blog 001",
        //         "shortDescription" : "post ni o 4em",
        //         "content" : "Eto testovoe napolnenie posta 001_001",
        //         "blogId" : "69456df24964d096c2cbfc27",
        //         "blogName" : "blogger_001",
        //         "createdAt" : "2025-12-19T15:23:30.839Z"
        //     } ]
        // }
        const entriesCount = Object.entries(res.body).length;
        expect(entriesCount).toBe(5);
        expect(res.body).toHaveProperty("pagesCount", 1);
        expect(res.body).toHaveProperty("page", 1);
        expect(res.body).toHaveProperty("pageSize", 10);
        expect(res.body).toHaveProperty("totalCount", 4);
        expect(res.body).toHaveProperty("items");
        expect(Array.isArray(res.body.items)).toBe(true);
        expect(res.body.items).toHaveLength(4);
        expect(res.body.items[0]).toHaveProperty("id");
        expect(res.body.items[0]).toHaveProperty("title");
        expect(res.body.items[0]).toHaveProperty("shortDescription");
        expect(res.body.items[0]).toHaveProperty("content");
        expect(res.body.items[0]).toHaveProperty("blogId");
        expect(res.body.items[0]).toHaveProperty("blogName");
        expect(res.body.items[0]).toHaveProperty("createdAt");
        expect(res.status).toBe(http_statuses_1.HttpStatus.Ok);
    }));
    it("GET '/api/posts/' - checking response with custom query params request - should respond with a list of posts (2 post entries total)", () => __awaiter(void 0, void 0, void 0, function* () {
        expect(yield query_repository_1.dataQueryRepository.returnBloggersAmount()).toBe(2);
        const res = yield (0, supertest_1.default)(testApp).get(`${router_pathes_1.POSTS_PATH}/`).query({
            pageNumber: 2,
            sortDirection: "asc",
            sortBy: "title",
            pageSize: 2,
        });
        // {
        //     "pagesCount" : 2,
        //     "page" : 2,
        //     "pageSize" : 2,
        //     "totalCount" : 4,
        //     "items" : [ {
        //         "id" : "694572bbaf6e391c3b116013",
        //         "title" : "post blog 002",
        //         "shortDescription" : "post ni o 4em",
        //         "content" : "Eto testovoe napolnenie posta 001_002",
        //         "blogId" : "694572bbaf6e391c3b116011",
        //         "blogName" : "blogger_001",
        //         "createdAt" : "2025-12-19T15:43:55.945Z"
        //     }, {
        //         "id" : "694572bcaf6e391c3b116016",
        //         "title" : "post blog 002",
        //         "shortDescription" : "horowii post",
        //         "content" : "Eto testovoe napolnenie posta 002_002",
        //         "blogId" : "694572bcaf6e391c3b116014",
        //         "blogName" : "blogger_002",
        //         "createdAt" : "2025-12-19T15:43:56.968Z"
        //     } ]
        // }
        const entriesCount = Object.entries(res.body).length;
        expect(entriesCount).toBe(5);
        expect(res.body).toHaveProperty("pagesCount", 2);
        expect(res.body).toHaveProperty("page", 2);
        expect(res.body).toHaveProperty("pageSize", 2);
        expect(res.body).toHaveProperty("totalCount", 4);
        expect(res.body).toHaveProperty("items");
        expect(Array.isArray(res.body.items)).toBe(true);
        expect(res.body.items).toHaveLength(2);
        expect(res.body.items[0]).toHaveProperty("id");
        expect(res.body.items[0]).toHaveProperty("title");
        expect(res.body.items[0]).toHaveProperty("shortDescription");
        expect(res.body.items[0]).toHaveProperty("content");
        expect(res.body.items[0]).toHaveProperty("blogId");
        expect(res.body.items[0]).toHaveProperty("blogName");
        expect(res.body.items[0]).toHaveProperty("createdAt");
        expect(res.status).toBe(http_statuses_1.HttpStatus.Ok);
    }));
    it("GET '/api/posts/' - checking response with broken/not allowed query params request - should respond with a list of posts (2 post entries total)", () => __awaiter(void 0, void 0, void 0, function* () {
        expect(yield query_repository_1.dataQueryRepository.returnBloggersAmount()).toBe(2);
        const res = yield (0, supertest_1.default)(testApp).get(`${router_pathes_1.POSTS_PATH}/`).query({
            pageNumber: "asd",
            sortDirection: "asc",
            sortBy: "title",
            pageSize: 2,
        });
        // {"errorsMessages":[{"message":"Page number must be a positive integer","field":"pageNumber"}]}
        expect(res.status).toBe(http_statuses_1.HttpStatus.BadRequest);
    }));
    it("POST '/api/posts/' - should add a post to the repository", () => __awaiter(void 0, void 0, void 0, function* () {
        // удивительно, но этот объект не видно изнутри! если объявить его снаружи, он не отправится
        if (blogId_1) {
            const correctPostInput = {
                title: "post blog 003",
                shortDescription: "o4erednoy post ni o 4em",
                content: "Eto testovoe napolnenie posta 001_003",
                blogId: blogId_1,
            };
            const res = yield (0, supertest_1.default)(testApp)
                .post(`${router_pathes_1.POSTS_PATH}/`)
                .set("Authorization", "Basic " + "YWRtaW46cXdlcnR5")
                .send(correctPostInput);
            const propertyCount = Object.keys(res.body).length;
            expect(propertyCount).toBe(7);
            expect(res.body.id).toBeDefined();
            expect(res.body.blogName).toBeDefined();
            expect(typeof res.body.id).toBe("string");
            expect(typeof res.body.blogName).toBe("string");
            expect(res.body).toHaveProperty("id");
            expect(res.body).toHaveProperty("title", "post blog 003");
            expect(res.body).toHaveProperty("shortDescription", "o4erednoy post ni o 4em");
            expect(res.body).toHaveProperty("content", "Eto testovoe napolnenie posta 001_003");
            expect(res.body).toHaveProperty("blogId", blogId_1);
            expect(res.body).toHaveProperty("blogName", "blogger_001");
            expect(res.body).toHaveProperty("createdAt");
            expect(res.status).toBe(http_statuses_1.HttpStatus.Created);
        }
        else {
            throw new Error("blogId_1 is not defined");
        }
    }));
    it("POST '/api/posts/' - shouldn't be able to add a post to the repository because of incorrect login/password pair", () => __awaiter(void 0, void 0, void 0, function* () {
        if (blogId_1) {
            const correctPostInput = {
                title: "post blog 003",
                shortDescription: "o4erednoy post ni o 4em",
                content: "Eto testovoe napolnenie posta 001_003",
                blogId: blogId_1,
            };
            const res = yield (0, supertest_1.default)(testApp)
                .post(`${router_pathes_1.POSTS_PATH}/`)
                .set("Authorization", "Basic " + "111111")
                .send(correctPostInput);
            expect(res.status).toBe(http_statuses_1.HttpStatus.Unauthorized);
            const anotherRes = yield (0, supertest_1.default)(testApp)
                .post(`${router_pathes_1.POSTS_PATH}/`)
                .set("Authorization", "111111 " + "YWRtaW46cXdlcnR5")
                .send(correctPostInput);
            expect(anotherRes.status).toBe(http_statuses_1.HttpStatus.Unauthorized);
        }
        else {
            throw new Error("blogId_1 is not defined");
        }
    }));
    it("GET '/api/posts/{id}' - should find a post entry and respond with a PostViewModel-formatted info about a requested post", () => __awaiter(void 0, void 0, void 0, function* () {
        const res = yield (0, supertest_1.default)(testApp).get(`${router_pathes_1.POSTS_PATH}/${postId_3}`);
        const propertyCount = Object.keys(res.body).length;
        expect(propertyCount).toBe(7);
        expect(res.body).toHaveProperty("id", postId_3);
        expect(res.body).toHaveProperty("title", "post blog 001");
        expect(res.body).toHaveProperty("shortDescription", "horowii post");
        expect(res.body).toHaveProperty("content", "Eto testovoe napolnenie posta 002_001");
        expect(res.body).toHaveProperty("blogId", blogId_2);
        expect(res.body).toHaveProperty("blogName", "blogger_002");
        expect(res.body).toHaveProperty("createdAt");
        expect(res.status).toBe(http_statuses_1.HttpStatus.Ok);
    }));
    it("GET '/api/posts/{id}' - shouldn't be able to insert a post because of non-existent blog ID, should respond with proper error-return message", () => __awaiter(void 0, void 0, void 0, function* () {
        const res = yield (0, supertest_1.default)(testApp).get(`${router_pathes_1.POSTS_PATH}/0000`);
        expect(res.status).toBe(http_statuses_1.HttpStatus.BadRequest);
    }));
    it("PUT '/api/posts/{id}' - should update a post", () => __awaiter(void 0, void 0, void 0, function* () {
        if (blogId_2) {
            const updatedPostInput = {
                title: "post blog 001",
                shortDescription: "OBNOVLENNII post - ni o 4em",
                content: "Eto OBNOVLENNOE testovoe napolnenie posta 001_003",
                blogId: blogId_2,
            };
            const res = yield (0, supertest_1.default)(testApp)
                .put(`${router_pathes_1.POSTS_PATH}/${postId_3}`)
                .set("Authorization", "Basic " + "YWRtaW46cXdlcnR5")
                .send(updatedPostInput);
            expect(res.status).toBe(http_statuses_1.HttpStatus.NoContent);
            const anotherResults = yield (0, supertest_1.default)(testApp).get(`${router_pathes_1.POSTS_PATH}/${postId_3}`);
            expect(anotherResults).toBeDefined();
            const propertyCount = Object.keys(anotherResults.body).length;
            expect(propertyCount).toBe(7);
            expect(anotherResults.status).toBe(http_statuses_1.HttpStatus.Ok);
            expect(anotherResults.body).toHaveProperty("id", postId_3);
            expect(anotherResults.body).toHaveProperty("title", "post blog 001");
            expect(anotherResults.body).toHaveProperty("shortDescription", "OBNOVLENNII post - ni o 4em");
            expect(anotherResults.body).toHaveProperty("content", "Eto OBNOVLENNOE testovoe napolnenie posta 001_003");
            expect(anotherResults.body).toHaveProperty("blogId", blogId_2);
            expect(anotherResults.body).toHaveProperty("blogName", "blogger_002");
            expect(anotherResults.body).toHaveProperty("createdAt");
        }
        else {
            throw new Error("blogId_2 is not defined");
        }
    }));
    it("PUT '/api/posts/{id}' - shouldn't be able to update a post because of incorrect login/password pair", () => __awaiter(void 0, void 0, void 0, function* () {
        if (blogId_2) {
            const updatedPostInput = {
                title: "post blog 001",
                shortDescription: "OBNOVLENNII post - ni o 4em",
                content: "Eto OBNOVLENNOE testovoe napolnenie posta 001_003",
                blogId: blogId_2,
            };
            const res = yield (0, supertest_1.default)(testApp)
                .put(`${router_pathes_1.POSTS_PATH}/${postId_3}`)
                .set("Authorization", "Basic " + "111111")
                .send(updatedPostInput);
            expect(res.status).toBe(http_statuses_1.HttpStatus.Unauthorized);
            const anotherRes = yield (0, supertest_1.default)(testApp)
                .put(`${router_pathes_1.POSTS_PATH}/${postId_3}`)
                .set("Authorization", "111111 " + "YWRtaW46cXdlcnR5")
                .send(updatedPostInput);
            expect(anotherRes.status).toBe(http_statuses_1.HttpStatus.Unauthorized);
        }
        else {
            throw new Error("blogId_2 is not defined");
        }
    }));
    it("DELETE '/api/posts/{id}' - shouldn't be able to delete a post because of incorrect login/password pair", () => __awaiter(void 0, void 0, void 0, function* () {
        const res = yield (0, supertest_1.default)(testApp)
            .delete(`${router_pathes_1.POSTS_PATH}/${postId_3}`)
            .set("Authorization", "Basic " + "111111");
        expect(res.status).toBe(http_statuses_1.HttpStatus.Unauthorized);
        const anotherRes = yield (0, supertest_1.default)(testApp)
            .delete(`${router_pathes_1.POSTS_PATH}/${postId_3}`)
            .set("Authorization", "111111 " + "YWRtaW46cXdlcnR5");
        expect(anotherRes.status).toBe(http_statuses_1.HttpStatus.Unauthorized);
    }));
    it("DELETE '/api/posts/{id}' - should delete a post", () => __awaiter(void 0, void 0, void 0, function* () {
        const res = yield (0, supertest_1.default)(testApp)
            .delete(`${router_pathes_1.POSTS_PATH}/${postId_3}`)
            .set("Authorization", "Basic " + "YWRtaW46cXdlcnR5");
        expect(res.status).toBe(http_statuses_1.HttpStatus.NoContent);
        const anotherResults = yield (0, supertest_1.default)(testApp)
            .get(`${router_pathes_1.POSTS_PATH}/${postId_3}`)
            .set("Authorization", "Basic " + "YWRtaW46cXdlcnR5");
        expect(anotherResults.status).toBe(http_statuses_1.HttpStatus.NotFound);
    }));
});
