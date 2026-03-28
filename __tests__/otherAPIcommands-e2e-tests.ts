import express from "express";
import { setupApp } from "../src/setup-app";
import request from "supertest";
import { closeDB, runDB } from "../src/db/mongo.db";
import { BlogInputModel } from "../src/routers/router-types/blog-input-model";
import { PostInputModel } from "../src/routers/router-types/post-input-model";
import { dataCommandRepository } from "../src/repository-layers/command-repository-layer/command-repository";
import { TESTING_PATH } from "../src/routers/pathes/router-pathes";
import { HttpStatus } from "../src/common/http-statuses/http-statuses";
import { dataQueryRepository } from "../src/repository-layers/query-repository-layer/query-repository";

describe("Test API commands for testing", () => {

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


    let blogId_1: string | undefined = "";
    let blogId_2: string | undefined = "";
    let postId_1: string | undefined = "";
    let postId_2: string | undefined = "";
    let postId_3: string | undefined = "";
    let postId_4: string | undefined = "";

    it("Creating test base entries, directly without endpoint calls", async () => {
        const newBlog_1: BlogInputModel = {
            name: "blogger_001",
            description: "takoy sebe blogger...",
            websiteUrl: "https://takoy.blogger.com",
        };
        blogId_1 = await dataCommandRepository.createNewBlog(newBlog_1);

        if (blogId_1) {
            const newPost_1: PostInputModel = {
                title: "post blog 001",
                shortDescription: "post ni o 4em",
                content: "Eto testovoe napolnenie posta 001_001",
                blogId: blogId_1,
            };
            await dataCommandRepository.createNewPost(newPost_1);

            const newPost_2 = {
                title: "post blog 002",
                shortDescription: "post ni o 4em",
                content: "Eto testovoe napolnenie posta 001_002",
                blogId: blogId_1,
            };
            await dataCommandRepository.createNewPost(newPost_2);
        } else {
            throw new Error("Could not create new blog - newBlog_1");
        }

        const newBlog_2: BlogInputModel = {
            name: "blogger_002",
            description: "a eto klassnii blogger!",
            websiteUrl: "https://klassnii.blogger.com",
        };
        blogId_2 = await dataCommandRepository.createNewBlog(newBlog_2);

        if (blogId_2) {
            const newPost_3: PostInputModel = {
                title: "post blog 001",
                shortDescription: "horowii post",
                content: "Eto testovoe napolnenie posta 002_001",
                blogId: blogId_2,
            };
            await dataCommandRepository.createNewPost(newPost_3);

            const newPost_4: PostInputModel = {
                title: "post blog 002",
                shortDescription: "horowii post",
                content: "Eto testovoe napolnenie posta 002_002",
                blogId: blogId_2,
            };
            await dataCommandRepository.createNewPost(newPost_4);
        } else {
            throw new Error("Could not create new blog - newBlog_2");
        }
    });


    it("DELETE ALL '/api/testing/all-data/' - should delete whole repository", async () => {

        const res = await request(testApp).delete(`${TESTING_PATH}/all-data/`);
        expect(await dataQueryRepository.returnBloggersAmount()).toBe(0);

        expect(res.status).toBe(HttpStatus.NoContent);
    });
});
