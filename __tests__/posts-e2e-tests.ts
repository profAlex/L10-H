import express from "express";
import { setupApp } from "../src/setup-app";
import { PostInputModel } from "../src/routers/router-types/post-input-model";
import request from "supertest";
import { closeDB, runDB } from "../src/db/mongo.db";
import { BlogInputModel } from "../src/routers/router-types/blog-input-model";
import { HttpStatus } from "../src/common/http-statuses/http-statuses";
import { POSTS_PATH, TESTING_PATH } from "../src/routers/pathes/router-pathes";
import { dataCommandRepository } from "../src/repository-layers/command-repository-layer/command-repository";
import { dataQueryRepository } from "../src/repository-layers/query-repository-layer/query-repository";

describe("Test API for managing posts", () => {
    const testApp = express();
    setupApp(testApp);

    beforeAll(async () => {
        await runDB();

        // Почему тут это не нужно?
        // testApp.listen(3003, () => {
        //     console.log(`Server started on port 3003`);
        // });

        const res = await request(testApp).delete(`${TESTING_PATH}/all-data`);
        expect(res.status).toBe(204);
    });

    afterAll(async () => {
        const res = await request(testApp).delete(`${TESTING_PATH}/all-data`);
        expect(res.status).toBe(204);
        // Закрываем после всех тестов
        await closeDB();
    });

    it("", async () => {
        const res = await request(testApp).delete(`${TESTING_PATH}/all-data`);
        expect(res.status).toBe(204);
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
            const insertedPost_1 =
                await dataCommandRepository.createNewPost(newPost_1);
            if (!insertedPost_1) {
                throw new Error(
                    "Failed to createNewPost, returned undefined...",
                );
            }

            const newPost_2 = {
                title: "post blog 002",
                shortDescription: "post ni o 4em",
                content: "Eto testovoe napolnenie posta 001_002",
                blogId: blogId_1,
            };
            const insertedPost_2 =
                await dataCommandRepository.createNewPost(newPost_2);
            if (!insertedPost_2) {
                throw new Error(
                    "Failed to createNewPost, returned undefined...",
                );
            }
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
            postId_3 = await dataCommandRepository.createNewPost(newPost_3);
            if (!postId_3) {
                throw new Error(
                    "Failed to createNewPost, returned undefined...",
                );
            }

            const newPost_4: PostInputModel = {
                title: "post blog 002",
                shortDescription: "horowii post",
                content: "Eto testovoe napolnenie posta 002_002",
                blogId: blogId_2,
            };
            const insertedPost_4 =
                await dataCommandRepository.createNewPost(newPost_4);
            if (!insertedPost_4) {
                throw new Error(
                    "Failed to createNewPost, returned undefined...",
                );
            }
        }
    });

    it("GET '/api/posts/' - checking response with empty query params request - should respond with a list of posts (4 post entries total)", async () => {
        expect(await dataQueryRepository.returnBloggersAmount()).toBe(2);

        const res = await request(testApp).get(`${POSTS_PATH}/`);

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

        expect(res.status).toBe(HttpStatus.Ok);
    });

    it("GET '/api/posts/' - checking response with custom query params request - should respond with a list of posts (2 post entries total)", async () => {
        expect(await dataQueryRepository.returnBloggersAmount()).toBe(2);

        const res = await request(testApp).get(`${POSTS_PATH}/`).query({
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

        expect(res.status).toBe(HttpStatus.Ok);
    });

    it("GET '/api/posts/' - checking response with broken/not allowed query params request - should respond with a list of posts (2 post entries total)", async () => {
        expect(await dataQueryRepository.returnBloggersAmount()).toBe(2);

        const res = await request(testApp).get(`${POSTS_PATH}/`).query({
            pageNumber: "asd",
            sortDirection: "asc",
            sortBy: "title",
            pageSize: 2,
        });

        // {"errorsMessages":[{"message":"Page number must be a positive integer","field":"pageNumber"}]}

        expect(res.status).toBe(HttpStatus.BadRequest);
    });

    it("POST '/api/posts/' - should add a post to the repository", async () => {
        // удивительно, но этот объект не видно изнутри! если объявить его снаружи, он не отправится
        if (blogId_1) {
            const correctPostInput: PostInputModel = {
                title: "post blog 003",
                shortDescription: "o4erednoy post ni o 4em",
                content: "Eto testovoe napolnenie posta 001_003",
                blogId: blogId_1,
            };

            const res = await request(testApp)
                .post(`${POSTS_PATH}/`)
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
            expect(res.body).toHaveProperty(
                "shortDescription",
                "o4erednoy post ni o 4em",
            );
            expect(res.body).toHaveProperty(
                "content",
                "Eto testovoe napolnenie posta 001_003",
            );
            expect(res.body).toHaveProperty("blogId", blogId_1);
            expect(res.body).toHaveProperty("blogName", "blogger_001");
            expect(res.body).toHaveProperty("createdAt");

            expect(res.status).toBe(HttpStatus.Created);
        } else {
            throw new Error("blogId_1 is not defined");
        }
    });

    it("POST '/api/posts/' - shouldn't be able to add a post to the repository because of incorrect login/password pair", async () => {
        if (blogId_1) {
            const correctPostInput: PostInputModel = {
                title: "post blog 003",
                shortDescription: "o4erednoy post ni o 4em",
                content: "Eto testovoe napolnenie posta 001_003",
                blogId: blogId_1,
            };

            const res = await request(testApp)
                .post(`${POSTS_PATH}/`)
                .set("Authorization", "Basic " + "111111")
                .send(correctPostInput);
            expect(res.status).toBe(HttpStatus.Unauthorized);

            const anotherRes = await request(testApp)
                .post(`${POSTS_PATH}/`)
                .set("Authorization", "111111 " + "YWRtaW46cXdlcnR5")
                .send(correctPostInput);
            expect(anotherRes.status).toBe(HttpStatus.Unauthorized);
        } else {
            throw new Error("blogId_1 is not defined");
        }
    });

    it("GET '/api/posts/{id}' - should find a post entry and respond with a PostViewModel-formatted info about a requested post", async () => {
        const res = await request(testApp).get(`${POSTS_PATH}/${postId_3}`);

        const propertyCount = Object.keys(res.body).length;
        expect(propertyCount).toBe(7);

        expect(res.body).toHaveProperty("id", postId_3);
        expect(res.body).toHaveProperty("title", "post blog 001");
        expect(res.body).toHaveProperty("shortDescription", "horowii post");
        expect(res.body).toHaveProperty(
            "content",
            "Eto testovoe napolnenie posta 002_001",
        );
        expect(res.body).toHaveProperty("blogId", blogId_2);
        expect(res.body).toHaveProperty("blogName", "blogger_002");
        expect(res.body).toHaveProperty("createdAt");

        expect(res.status).toBe(HttpStatus.Ok);
    });

    it("GET '/api/posts/{id}' - shouldn't be able to insert a post because of non-existent blog ID, should respond with proper error-return message", async () => {
        const res = await request(testApp).get(`${POSTS_PATH}/0000`);
        expect(res.status).toBe(HttpStatus.BadRequest);
    });

    it("PUT '/api/posts/{id}' - should update a post", async () => {
        if (blogId_2) {
            const updatedPostInput: PostInputModel = {
                title: "post blog 001",
                shortDescription: "OBNOVLENNII post - ni o 4em",
                content: "Eto OBNOVLENNOE testovoe napolnenie posta 001_003",
                blogId: blogId_2,
            };

            const res = await request(testApp)
                .put(`${POSTS_PATH}/${postId_3}`)
                .set("Authorization", "Basic " + "YWRtaW46cXdlcnR5")
                .send(updatedPostInput);
            expect(res.status).toBe(HttpStatus.NoContent);

            const anotherResults = await request(testApp).get(
                `${POSTS_PATH}/${postId_3}`,
            );
            expect(anotherResults).toBeDefined();
            const propertyCount = Object.keys(anotherResults.body).length;
            expect(propertyCount).toBe(7);
            expect(anotherResults.status).toBe(HttpStatus.Ok);

            expect(anotherResults.body).toHaveProperty("id", postId_3);
            expect(anotherResults.body).toHaveProperty(
                "title",
                "post blog 001",
            );
            expect(anotherResults.body).toHaveProperty(
                "shortDescription",
                "OBNOVLENNII post - ni o 4em",
            );
            expect(anotherResults.body).toHaveProperty(
                "content",
                "Eto OBNOVLENNOE testovoe napolnenie posta 001_003",
            );
            expect(anotherResults.body).toHaveProperty("blogId", blogId_2);
            expect(anotherResults.body).toHaveProperty(
                "blogName",
                "blogger_002",
            );
            expect(anotherResults.body).toHaveProperty("createdAt");
        } else {
            throw new Error("blogId_2 is not defined");
        }
    });

    it("PUT '/api/posts/{id}' - shouldn't be able to update a post because of incorrect login/password pair", async () => {
        if (blogId_2) {
            const updatedPostInput: PostInputModel = {
                title: "post blog 001",
                shortDescription: "OBNOVLENNII post - ni o 4em",
                content: "Eto OBNOVLENNOE testovoe napolnenie posta 001_003",
                blogId: blogId_2,
            };

            const res = await request(testApp)
                .put(`${POSTS_PATH}/${postId_3}`)
                .set("Authorization", "Basic " + "111111")
                .send(updatedPostInput);
            expect(res.status).toBe(HttpStatus.Unauthorized);

            const anotherRes = await request(testApp)
                .put(`${POSTS_PATH}/${postId_3}`)
                .set("Authorization", "111111 " + "YWRtaW46cXdlcnR5")
                .send(updatedPostInput);
            expect(anotherRes.status).toBe(HttpStatus.Unauthorized);
        } else {
            throw new Error("blogId_2 is not defined");
        }
    });

    it("DELETE '/api/posts/{id}' - shouldn't be able to delete a post because of incorrect login/password pair", async () => {
        const res = await request(testApp)
            .delete(`${POSTS_PATH}/${postId_3}`)
            .set("Authorization", "Basic " + "111111");
        expect(res.status).toBe(HttpStatus.Unauthorized);

        const anotherRes = await request(testApp)
            .delete(`${POSTS_PATH}/${postId_3}`)
            .set("Authorization", "111111 " + "YWRtaW46cXdlcnR5");
        expect(anotherRes.status).toBe(HttpStatus.Unauthorized);
    });

    it("DELETE '/api/posts/{id}' - should delete a post", async () => {
        const res = await request(testApp)
            .delete(`${POSTS_PATH}/${postId_3}`)
            .set("Authorization", "Basic " + "YWRtaW46cXdlcnR5");
        expect(res.status).toBe(HttpStatus.NoContent);

        const anotherResults = await request(testApp)
            .get(`${POSTS_PATH}/${postId_3}`)
            .set("Authorization", "Basic " + "YWRtaW46cXdlcnR5");
        expect(anotherResults.status).toBe(HttpStatus.NotFound);
    });
});
