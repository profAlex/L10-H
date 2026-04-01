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
const command_repository_1 = require("../src/repository-layers/command-repository-layer/command-repository");
const router_pathes_1 = require("../src/routers/pathes/router-pathes");
const http_statuses_1 = require("../src/common/http-statuses/http-statuses");
const query_repository_1 = require("../src/repository-layers/query-repository-layer/query-repository");
describe("Test API commands for testing", () => {
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
            yield command_repository_1.dataCommandRepository.createNewPost(newPost_1);
            const newPost_2 = {
                title: "post blog 002",
                shortDescription: "post ni o 4em",
                content: "Eto testovoe napolnenie posta 001_002",
                blogId: blogId_1,
            };
            yield command_repository_1.dataCommandRepository.createNewPost(newPost_2);
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
            yield command_repository_1.dataCommandRepository.createNewPost(newPost_3);
            const newPost_4 = {
                title: "post blog 002",
                shortDescription: "horowii post",
                content: "Eto testovoe napolnenie posta 002_002",
                blogId: blogId_2,
            };
            yield command_repository_1.dataCommandRepository.createNewPost(newPost_4);
        }
        else {
            throw new Error("Could not create new blog - newBlog_2");
        }
    }));
    it("DELETE ALL '/api/testing/all-data/' - should delete whole repository", () => __awaiter(void 0, void 0, void 0, function* () {
        const res = yield (0, supertest_1.default)(testApp).delete(`${router_pathes_1.TESTING_PATH}/all-data/`);
        expect(yield query_repository_1.dataQueryRepository.returnBloggersAmount()).toBe(0);
        expect(res.status).toBe(http_statuses_1.HttpStatus.NoContent);
    }));
});
