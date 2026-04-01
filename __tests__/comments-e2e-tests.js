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
const mongo_db_1 = require("../src/db/mongo.db");
const supertest_1 = __importDefault(require("supertest"));
const router_pathes_1 = require("../src/routers/pathes/router-pathes");
const command_repository_1 = require("../src/repository-layers/command-repository-layer/command-repository");
const http_statuses_1 = require("../src/common/http-statuses/http-statuses");
describe("Test API for managing comments", () => {
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
            postId_1 = yield command_repository_1.dataCommandRepository.createNewPost(newPost_1);
            if (!postId_1) {
                throw new Error("Failed to createNewPost, returned undefined...");
            }
            const newPost_2 = {
                title: "post blog 002",
                shortDescription: "post ni o 4em",
                content: "Eto testovoe napolnenie posta 001_002",
                blogId: blogId_1,
            };
            postId_2 = yield command_repository_1.dataCommandRepository.createNewPost(newPost_2);
            if (!postId_2) {
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
            postId_4 = yield command_repository_1.dataCommandRepository.createNewPost(newPost_4);
            if (!postId_4) {
                throw new Error("Failed to createNewPost, returned undefined...");
            }
        }
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
            email: "test_email@yandex.com",
        };
        userId_1 = yield command_repository_1.dataCommandRepository.createNewUser(newUser_1);
        const newUser_2 = {
            login: "hello_world_2",
            password: "hello_world",
            email: "test_email_2@yandex.com",
        };
        userId_2 = yield command_repository_1.dataCommandRepository.createNewUser(newUser_2);
        const newUser_3 = {
            login: "hello_world_3",
            password: "hello_world",
            email: "test_email_3@yandex.com",
        };
        userId_3 = yield command_repository_1.dataCommandRepository.createNewUser(newUser_3);
        const newUser_4 = {
            login: "hello_world_4",
            password: "hello_world",
            email: "test_email_4@yandex.com",
        };
        userId_4 = yield command_repository_1.dataCommandRepository.createNewUser(newUser_4);
    }));
    it("POST /posts/{postId}/comments - successfully creating comment", () => __awaiter(void 0, void 0, void 0, function* () {
        const loginCreds = {
            loginOrEmail: "hello_world",
            password: "hello_world",
        };
        const loginAttempt = yield (0, supertest_1.default)(testApp)
            .post(`${router_pathes_1.AUTH_PATH}/login`)
            .send(loginCreds);
        expect(Object.entries(loginAttempt.body).length).toBe(1);
        expect(Object.keys(loginAttempt.body).length).toBe(1);
        expect(loginAttempt.body).toHaveProperty("accessToken");
        const comment = {
            content: "stringstringstringst",
        };
        const tokenRecieved = loginAttempt.body["accessToken"];
        const createComment = yield (0, supertest_1.default)(testApp)
            .post(`${router_pathes_1.POSTS_PATH}/${postId_1}/comments`)
            .set("Authorization", "Bearer " + tokenRecieved.toString())
            .send(comment);
        expect(Object.entries(createComment.body).length).toBe(4);
        expect(createComment.body).toHaveProperty("id");
        expect(createComment.body).toHaveProperty("content");
        expect(createComment.body).toHaveProperty("commentatorInfo");
        expect(createComment.body).toHaveProperty("createdAt");
        expect(Object.keys(createComment.body.commentatorInfo).length).toBe(2);
        expect(createComment.body.commentatorInfo).toHaveProperty("userId");
        expect(createComment.body.commentatorInfo).toHaveProperty("userLogin", loginCreds.loginOrEmail);
        expect(createComment.status).toEqual(http_statuses_1.HttpStatus.Created);
        // const res = await request(testApp).get(
        //     `${COMMENTS_PATH}/${IdParamName.CommentId}`,
    }));
    it("POST /posts/{postId}/comments - shouldn't be able to create comment due to bad input data, or wrong cred, or wrong postId", () => __awaiter(void 0, void 0, void 0, function* () {
        const wrongLoginCreds = {
            loginOrEmail: "hello_world",
            password: "helo_world",
        };
        const loginCreds = {
            loginOrEmail: "hello_world",
            password: "hello_world",
        };
        const loginAttempt = yield (0, supertest_1.default)(testApp)
            .post(`${router_pathes_1.AUTH_PATH}/login`)
            .send(wrongLoginCreds);
        expect(loginAttempt.status).toEqual(http_statuses_1.HttpStatus.Unauthorized);
        const anotherLoginAttempt = yield (0, supertest_1.default)(testApp)
            .post(`${router_pathes_1.AUTH_PATH}/login`)
            .send(loginCreds);
        expect(Object.entries(anotherLoginAttempt.body).length).toBe(1);
        expect(Object.keys(anotherLoginAttempt.body).length).toBe(1);
        expect(anotherLoginAttempt.body).toHaveProperty("accessToken");
        const wrongComment = {
            conten: "stringstringstringst", // wrong name of the field - should be "content"
        };
        const tokenRecieved = anotherLoginAttempt.body["accessToken"];
        const createComment = yield (0, supertest_1.default)(testApp)
            .post(`${router_pathes_1.POSTS_PATH}/${postId_1}/comments`)
            .set("Authorization", "Bearer " + tokenRecieved.toString())
            .send(wrongComment);
        expect(createComment.status).toEqual(http_statuses_1.HttpStatus.BadRequest);
    }));
    let commentId = "";
    it("GET /posts/{postId}/comments - successful retrieving comment", () => __awaiter(void 0, void 0, void 0, function* () {
        // const loginCreds = {
        //     loginOrEmail: "hello_world",
        //     password: "hello_world",
        // };
        //
        // const loginAttempt = await request(testApp)
        //     .post(`${AUTH_PATH}/login`)
        //     .send(loginCreds);
        //
        // expect(Object.entries(loginAttempt.body).length).toBe(1);
        // expect(Object.keys(loginAttempt.body).length).toBe(1);
        // expect(loginAttempt.body).toHaveProperty("accessToken");
        //
        // const tokenRecieved = loginAttempt.body["accessToken"];
        const retrieveComment = yield (0, supertest_1.default)(testApp).get(`${router_pathes_1.POSTS_PATH}/${postId_1}/comments`);
        // .set("Authorization", "Bearer " + tokenRecieved.toString());
        expect(Object.keys(retrieveComment.body).length).toBe(5);
        expect(retrieveComment.body).toHaveProperty("items");
        commentId = retrieveComment.body.items[0].id;
        const content = retrieveComment.body.items[0].content;
        expect(content).toEqual("stringstringstringst");
        expect(retrieveComment.status).toEqual(http_statuses_1.HttpStatus.Ok);
    }));
    it("GET /comments/{commentId}/ - successful retrieving comment", () => __awaiter(void 0, void 0, void 0, function* () {
        // const loginCreds = {
        //     loginOrEmail: "hello_world",
        //     password: "hello_world",
        // };
        //
        // const loginAttempt = await request(testApp)
        //     .post(`${AUTH_PATH}/login`)
        //     .send(loginCreds);
        //
        // expect(Object.entries(loginAttempt.body).length).toBe(1);
        // expect(Object.keys(loginAttempt.body).length).toBe(1);
        // expect(loginAttempt.body).toHaveProperty("accessToken");
        //
        // const tokenRecieved = loginAttempt.body["accessToken"];
        const retrieveComment = yield (0, supertest_1.default)(testApp).get(`${router_pathes_1.COMMENTS_PATH}/${commentId}/`);
        // .set("Authorization", "Bearer " + tokenRecieved.toString());
        expect(Object.keys(retrieveComment.body).length).toBe(4);
        expect(retrieveComment.status).toEqual(http_statuses_1.HttpStatus.Ok);
    }));
    it("PUT /comments/{commentId}/ - successful modifying comment", () => __awaiter(void 0, void 0, void 0, function* () {
        const loginCreds = {
            loginOrEmail: "hello_world",
            password: "hello_world",
        };
        const loginAttempt = yield (0, supertest_1.default)(testApp)
            .post(`${router_pathes_1.AUTH_PATH}/login`)
            .send(loginCreds);
        expect(Object.entries(loginAttempt.body).length).toBe(1);
        expect(Object.keys(loginAttempt.body).length).toBe(1);
        expect(loginAttempt.body).toHaveProperty("accessToken");
        const tokenRecieved = loginAttempt.body["accessToken"];
        const modifiedComment = {
            content: "modified stringstringstringst", // wrong name of the field - should be "content"
        };
        const retrieveComment = yield (0, supertest_1.default)(testApp)
            .put(`${router_pathes_1.COMMENTS_PATH}/${commentId}/`)
            .set("Authorization", "Bearer " + tokenRecieved.toString())
            .send(modifiedComment);
        expect(retrieveComment.status).toEqual(http_statuses_1.HttpStatus.NoContent);
        const retrieveModifiedComment = yield (0, supertest_1.default)(testApp).get(`${router_pathes_1.COMMENTS_PATH}/${commentId}/`);
        expect(Object.keys(retrieveModifiedComment.body).length).toBe(4);
        expect(retrieveModifiedComment.body).toHaveProperty("content");
        const content = retrieveModifiedComment.body.content;
        expect(content).toEqual("modified stringstringstringst");
        expect(retrieveModifiedComment.status).toEqual(http_statuses_1.HttpStatus.Ok);
    }));
    it("DELETE /comments/{commentId}/ - successful deleting comment", () => __awaiter(void 0, void 0, void 0, function* () {
        const loginCreds = {
            loginOrEmail: "hello_world",
            password: "hello_world",
        };
        const loginAttempt = yield (0, supertest_1.default)(testApp)
            .post(`${router_pathes_1.AUTH_PATH}/login`)
            .send(loginCreds);
        expect(Object.entries(loginAttempt.body).length).toBe(1);
        expect(Object.keys(loginAttempt.body).length).toBe(1);
        expect(loginAttempt.body).toHaveProperty("accessToken");
        const tokenRecieved = loginAttempt.body["accessToken"];
        const retrieveComment = yield (0, supertest_1.default)(testApp)
            .delete(`${router_pathes_1.COMMENTS_PATH}/${commentId}/`)
            .set("Authorization", "Bearer " + tokenRecieved.toString());
        expect(retrieveComment.status).toEqual(http_statuses_1.HttpStatus.NoContent);
        const retrieveModifiedComment = yield (0, supertest_1.default)(testApp).get(`${router_pathes_1.COMMENTS_PATH}/${commentId}/`);
        expect(retrieveModifiedComment.status).toEqual(http_statuses_1.HttpStatus.NotFound);
    }));
});
