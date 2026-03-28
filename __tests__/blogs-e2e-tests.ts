import request from "supertest";
import { Response } from "supertest";
import express from "express";
import { setupApp } from "../src/setup-app";
import { BlogInputModel } from "../src/routers/router-types/blog-input-model";
import {
    bloggersCollection,
    closeDB,
    postsCollection,
    runDB,
} from "../src/db/mongo.db";
import { ObjectId } from "mongodb";
import { PostInputModel } from "../src/routers/router-types/post-input-model";
import { BlogPostInputModel } from "../src/routers/router-types/blog-post-input-model";
import { BLOGS_PATH, TESTING_PATH } from "../src/routers/pathes/router-pathes";
import { dataCommandRepository } from "../src/repository-layers/command-repository-layer/command-repository";
import { HttpStatus } from "../src/common/http-statuses/http-statuses";
import { dataQueryRepository } from "../src/repository-layers/query-repository-layer/query-repository";

describe("Test API for managing blogs(bloggers)", () => {
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

    let blogId_1: string | undefined = "";
    let blogId_2: string | undefined = "";

    it("Creating test base entries, directly without endpoint calls", async () => {
        const newBlog_1: BlogInputModel = {
            name: "blogger_001",
            description: "takoy sebe blogger...",
            websiteUrl: "https://takoy.blogger.com",
        };
        blogId_1 = await dataCommandRepository.createNewBlog(newBlog_1);
        // blogId_1 = insertedBlog_1.id;

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

    it("GET '/api/blogs/' - should respond with a list of bloggers (total 2 entries in items object)", async () => {
        const res = await request(testApp).get(`${BLOGS_PATH}/`);

        const entriesCount = Object.values(res.body.items).length;

        // {
        //     "pagesCount" : 1,
        //     "page" : 1,
        //     "pageSize" : 10,
        //     "totalCount" : 2,
        //
        //     "items" : [ {
        //         "id" : "69426b01954a8971c2fa4ca7",
        //         "name" : "blogger_002",
        //         "description" : "a eto klassnii blogger!",
        //         "websiteUrl" : "https://klassnii.blogger.com",
        //         "createdAt" : "2025-12-17T08:34:09.999Z",
        //         "isMembership" : false
        //     }, {
        //         "id" : "69426b01954a8971c2fa4ca4",
        //         "name" : "blogger_001",
        //         "description" : "takoy sebe blogger...",
        //         "websiteUrl" : "https://takoy.blogger.com",
        //         "createdAt" : "2025-12-17T08:34:09.570Z",
        //         "isMembership" : false
        //     } ]
        // }

        expect(entriesCount).toBe(2);

        expect(res.status).toBe(HttpStatus.Ok);
    });

    it("GET '/api/blogs/' - same request but with custom query parameters - should respond with a list of bloggers (total 1 entries in items object)", async () => {
        const res: Response = await request(testApp)
            .get(`${BLOGS_PATH}/`)
            .query({
                searchNameTerm: "klas",
                pageNumber: 1,
                sortDirection: "asc",
                sortBy: "name",
                pageSize: 20,
            });

        const entriesCount = Object.values(res.body.items).length;

        // {
        //     "pagesCount" : 1,
        //     "page" : 1,
        //     "pageSize" : 20,
        //     "totalCount" : 1,
        //     "items" : [ {
        //         "id" : "69453fe2e253b3c5f4172458",
        //         "name" : "blogger_002",
        //         "description" : "a eto klassnii blogger!",
        //         "websiteUrl" : "https://klassnii.blogger.com",
        //         "createdAt" : "2025-12-19T12:06:58.701Z",
        //         "isMembership" : false
        //     } ]
        // }

        expect(res.body).toHaveProperty("pagesCount", 1);
        expect(res.body).toHaveProperty("page", 1);
        expect(res.body).toHaveProperty("pageSize", 20);
        expect(res.body).toHaveProperty("totalCount", 1);
        expect(res.body).toHaveProperty("items");
        expect(Array.isArray(res.body.items)).toBe(true);

        expect(res.body.items).toHaveLength(1);

        expect(res.status).toBe(HttpStatus.Ok);
    });

    it("GET '/api/blogs/' - same request but with custom query parameters - checking if searchNameTerm: '' works properly - should respond with a list of bloggers (total 2 entries in items object)", async () => {
        const res: Response = await request(testApp)
            .get(`${BLOGS_PATH}/`)
            .query({
                searchNameTerm: "",
                pageNumber: 1,
                sortDirection: "asc",
                sortBy: "name",
                pageSize: 20,
            });

        const entriesCount = Object.values(res.body.items).length;

        // {
        //     "pagesCount" : 1,
        //     "page" : 1,
        //     "pageSize" : 20,
        //     "totalCount" : 2,
        //     "items" : [ {
        //         "id" : "69455190cddbaaba0a264fe8",
        //         "name" : "blogger_001",
        //         "description" : "takoy sebe blogger...",
        //         "websiteUrl" : "https://takoy.blogger.com",
        //         "createdAt" : "2025-12-19T13:22:24.295Z",
        //         "isMembership" : false
        //     }, {
        //         "id" : "69455191cddbaaba0a264feb",
        //         "name" : "blogger_002",
        //         "description" : "a eto klassnii blogger!",
        //         "websiteUrl" : "https://klassnii.blogger.com",
        //         "createdAt" : "2025-12-19T13:22:25.284Z",
        //         "isMembership" : false
        //     } ]
        // }

        expect(res.body).toHaveProperty("pagesCount", 1);
        expect(res.body).toHaveProperty("page", 1);
        expect(res.body).toHaveProperty("pageSize", 20);
        expect(res.body).toHaveProperty("totalCount", 2);
        expect(res.body).toHaveProperty("items");
        expect(Array.isArray(res.body.items)).toBe(true);

        expect(res.body.items).toHaveLength(2);

        expect(res.status).toBe(HttpStatus.Ok);
    });

    it("GET '/api/blogs/' - same request but with custom query parameters - checking if searchNameTerm: null works properly - should respond with a list of bloggers (total 2 entries in items object)", async () => {
        const res: Response = await request(testApp)
            .get(`${BLOGS_PATH}/`)
            .query({
                searchNameTerm: null,
                pageNumber: 1,
                sortDirection: "asc",
                sortBy: "name",
                pageSize: 20,
            });

        const entriesCount = Object.values(res.body.items).length;

        // {
        //     "pagesCount" : 1,
        //     "page" : 1,
        //     "pageSize" : 20,
        //     "totalCount" : 2,
        //     "items" : [ {
        //         "id" : "6945522774237c3203c2ccd7",
        //         "name" : "blogger_001",
        //         "description" : "takoy sebe blogger...",
        //         "websiteUrl" : "https://takoy.blogger.com",
        //         "createdAt" : "2025-12-19T13:24:55.640Z",
        //         "isMembership" : false
        //     }, {
        //         "id" : "6945522874237c3203c2ccda",
        //         "name" : "blogger_002",
        //         "description" : "a eto klassnii blogger!",
        //         "websiteUrl" : "https://klassnii.blogger.com",
        //         "createdAt" : "2025-12-19T13:24:56.646Z",
        //         "isMembership" : false
        //     } ]
        // }

        expect(res.body).toHaveProperty("pagesCount", 1);
        expect(res.body).toHaveProperty("page", 1);
        expect(res.body).toHaveProperty("pageSize", 20);
        expect(res.body).toHaveProperty("totalCount", 2);
        expect(res.body).toHaveProperty("items");
        expect(Array.isArray(res.body.items)).toBe(true);

        expect(res.body.items).toHaveLength(2);

        expect(res.status).toBe(HttpStatus.Ok);
    });

    it("GET '/api/blogs/:blogId/posts - Returns all posts for specified blog without query parameters (defaulted to preset numbers) - returns 2 items, with fields check.", async () => {
        const res: Response = await request(testApp).get(
            `${BLOGS_PATH}/${blogId_1}/posts/`,
        );

        // {
        //     "pagesCount" : 1,
        //     "page" : 1,
        //     "pageSize" : 10,
        //     "totalCount" : 2,
        //     "items" : [ {
        //         "id" : "69429c9a6fa871ce4ef2308b",
        //         "title" : "post blog 002",
        //         "shortDescription" : "post ni o 4em",
        //         "content" : "Eto testovoe napolnenie posta 001_002",
        //         "blogId" : "69429c996fa871ce4ef23089",
        //         "blogName" : "blogger_001",
        //         "createdAt" : "2025-12-17T12:05:46.225Z"
        //     }, {
        //         "id" : "69429c996fa871ce4ef2308a",
        //         "title" : "post blog 001",
        //         "shortDescription" : "post ni o 4em",
        //         "content" : "Eto testovoe napolnenie posta 001_001",
        //         "blogId" : "69429c996fa871ce4ef23089",
        //         "blogName" : "blogger_001",
        //         "createdAt" : "2025-12-17T12:05:46.037Z"
        //     } ]
        // }

        expect(res.body).toHaveProperty("pagesCount", 1);
        expect(res.body).toHaveProperty("page", 1);
        expect(res.body).toHaveProperty("pageSize", 10);
        expect(res.body).toHaveProperty("totalCount", 2);
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

        expect(res.body.items[1]).toHaveProperty("id");
        expect(res.body.items[1]).toHaveProperty("title");
        expect(res.body.items[1]).toHaveProperty("shortDescription");
        expect(res.body.items[1]).toHaveProperty("content");
        expect(res.body.items[1]).toHaveProperty("blogId");
        expect(res.body.items[1]).toHaveProperty("blogName");
        expect(res.body.items[1]).toHaveProperty("createdAt");

        expect(res.body.items[0].blogId).toEqual(blogId_1);
        expect(res.body.items[1].blogId).toEqual(blogId_1);

        expect(res.status).toBe(HttpStatus.Ok);
        // console.log();
    });

    it("GET '/api/blogs/:blogId/posts - Returns all posts for specified blog, with custom query parameters - returns 2 items, with fields check.", async () => {
        const res: Response = await request(testApp)
            .get(`${BLOGS_PATH}/${blogId_1}/posts/`)
            .query({
                pageNumber: 2,
                sortDirection: "asc",
                sortBy: "title",
                pageSize: 1,
            });

        // {
        //     "pagesCount" : 2,
        //     "page" : 2,
        //     "pageSize" : 1,
        //     "totalCount" : 2,
        //     "items" : [ {
        //         "id" : "69445305fbce4a5c1941e70c",
        //         "title" : "post blog 002",
        //         "shortDescription" : "post ni o 4em",
        //         "content" : "Eto testovoe napolnenie posta 001_002",
        //         "blogId" : "69445305fbce4a5c1941e70a",
        //         "blogName" : "blogger_001",
        //         "createdAt" : "2025-12-18T19:16:21.790Z"
        //     } ]
        // }

        expect(res.body).toHaveProperty("pagesCount", 2);
        expect(res.body).toHaveProperty("page", 2);
        expect(res.body).toHaveProperty("pageSize", 1);
        expect(res.body).toHaveProperty("totalCount", 2);
        expect(res.body).toHaveProperty("items");
        expect(Array.isArray(res.body.items)).toBe(true);

        expect(res.body.items).toHaveLength(1);

        expect(res.body.items[0]).toHaveProperty("id");
        expect(res.body.items[0]).toHaveProperty("title");
        expect(res.body.items[0]).toHaveProperty("shortDescription");
        expect(res.body.items[0]).toHaveProperty("content");
        expect(res.body.items[0]).toHaveProperty("blogId");
        expect(res.body.items[0]).toHaveProperty("blogName", "blogger_001");
        expect(res.body.items[0]).toHaveProperty("createdAt");

        expect(res.body.items[0].blogId).toEqual(blogId_1);

        expect(res.status).toBe(HttpStatus.Ok);
        // console.log();
    });

    it("POST '/api/blogs/:blogId/posts' - should add a post to the repository to specified blog with blogId", async () => {
        expect(await dataQueryRepository.returnBloggersAmount()).toBe(2);

        const newPost_1: BlogPostInputModel = {
            title: "post blog 003",
            shortDescription: "otli4nii post",
            content: "Eto testovoe napolnenie ewe odnogo novogo posta",
        };

        const res = await request(testApp)
            .post(`${BLOGS_PATH}/${blogId_1}/posts/`)
            .set("Authorization", "Basic " + "YWRtaW46cXdlcnR5")
            .send(newPost_1);

        // {
        //     "id": "6944763d0f22d56bf9e8535f",
        //     "title": "post blog 003",
        //     "shortDescription": "otli4nii post",
        //     "content": "Eto testovoe napolnenie ewe odnogo novogo posta",
        //     "blogId": "6944763c0f22d56bf9e85359",
        //     "blogName": "blogger_001",
        //     "createdAt": "2025-12-18T21:46:37.717Z"
        // }

        const propertyCount = Object.keys(res.body).length;
        expect(propertyCount).toBe(7);

        expect(res.body.id).toBeDefined();
        expect(res.body).toHaveProperty("title", "post blog 003");
        expect(res.body).toHaveProperty("shortDescription", "otli4nii post");
        expect(res.body).toHaveProperty(
            "content",
            "Eto testovoe napolnenie ewe odnogo novogo posta",
        );
        expect(res.body).toHaveProperty("blogId");
        expect(res.body).toHaveProperty("blogName", "blogger_001");
        expect(res.body).toHaveProperty("createdAt");

        expect(res.status).toBe(HttpStatus.Created);
    });

    it("POST '/api/blogs/' - should add a blog to the repository", async () => {
        expect(await dataQueryRepository.returnBloggersAmount()).toBe(2);

        const correctBlogInput: BlogInputModel = {
            name: "MI OBRECHENI",
            description: "norm takoy blog",
            websiteUrl: "https://mi-obrecheni.herokuapp.com/",
        };

        const res = await request(testApp)
            .post(`${BLOGS_PATH}/`)
            .set("Authorization", "Basic " + "YWRtaW46cXdlcnR5")
            .send(correctBlogInput);
        expect(await dataQueryRepository.returnBloggersAmount()).toBe(3);

        // console.log(res.body);
        const propertyCount = Object.keys(res.body).length;
        expect(propertyCount).toBe(6);

        expect(res.body.id).toBeDefined();
        expect(typeof res.body.id).toBe("string");
        expect(res.body).toHaveProperty("name", "MI OBRECHENI");
        expect(res.body).toHaveProperty("description", "norm takoy blog");
        expect(res.body).toHaveProperty(
            "websiteUrl",
            "https://mi-obrecheni.herokuapp.com/",
        );
        expect(res.body).toHaveProperty("createdAt");
        expect(res.body).toHaveProperty("isMembership", false);
        // expect(res.body).toHaveProperty('isMembership', true);

        expect(res.status).toBe(HttpStatus.Created);

        // const res1 = await request(testApp).get(`${BLOGS_PATH}/${blogId_1}`);
        //
        // const propertyCount1 = Object.keys(res1.body).length;
        // expect(propertyCount1).toBe(6);
    });

    it("POST '/api/blogs/' - shouldn't be able to add a blog to the repository with wrong login/password", async () => {
        expect(await dataQueryRepository.returnBloggersAmount()).toBe(3);

        const correctBlogInput: BlogInputModel = {
            name: "MI OBRECHENI",
            description: "norm takoy blog",
            websiteUrl: "https://mi-obrecheni.herokuapp.com/",
        };

        const res = await request(testApp)
            .post(`${BLOGS_PATH}/`)
            .set("Authorization", "Basic " + "111111")
            .send(correctBlogInput);
        expect(res.status).toBe(HttpStatus.Unauthorized);

        const anotherRes = await request(testApp)
            .post(`${BLOGS_PATH}/`)
            .set("Authorization", "111111 " + "YWRtaW46cXdlcnR5")
            .send(correctBlogInput);
        expect(anotherRes.status).toBe(HttpStatus.Unauthorized);
    });

    it("GET '/api/blogs/{id}' - should respond with a BlogViewModel-formatted info about a requested blog", async () => {
        expect(await dataQueryRepository.returnBloggersAmount()).toBe(3);

        const res = await request(testApp).get(`${BLOGS_PATH}/${blogId_1}`);

        const propertyCount = Object.keys(res.body).length;
        expect(propertyCount).toBe(6);

        expect(res.body).toHaveProperty("id", blogId_1);
        expect(res.body).toHaveProperty("name", "blogger_001");
        expect(res.body).toHaveProperty("description", "takoy sebe blogger...");
        expect(res.body).toHaveProperty(
            "websiteUrl",
            "https://takoy.blogger.com",
        );

        expect(res.status).toBe(HttpStatus.Ok);
    });

    it("GET '/api/blogs/{id}' - shouldn't be able to find anything because of non-existing id and return proper return-code", async () => {
        const res = await request(testApp).get(`${BLOGS_PATH}/aaaaa`);
        expect(res.status).toBe(HttpStatus.BadRequest);
    });

    it("PUT '/api/blogs/{id}' - should correctly update a blog", async () => {
        expect(await dataQueryRepository.returnBloggersAmount()).toBe(3);

        const updatedBlogInput: BlogInputModel = {
            name: "updated name",
            description: "updated description",
            websiteUrl: "https://takoy.blogger.com",
        };

        const res = await request(testApp)
            .put(`${BLOGS_PATH}/${blogId_1}`)
            .set("Authorization", "Basic " + "YWRtaW46cXdlcnR5")
            .send(updatedBlogInput);
        expect(await dataQueryRepository.returnBloggersAmount()).toBe(3);
        expect(res.status).toBe(HttpStatus.NoContent);

        const anotherResults = await request(testApp).get(
            `${BLOGS_PATH}/${blogId_1}`,
        );
        expect(anotherResults.status).toBe(HttpStatus.Ok);
        expect(anotherResults).toBeDefined();
        expect(anotherResults.body).toHaveProperty("id", blogId_1);
        expect(anotherResults.body).toHaveProperty("name", "updated name");
        expect(anotherResults.body).toHaveProperty(
            "description",
            "updated description",
        );
        expect(anotherResults.body).toHaveProperty(
            "websiteUrl",
            "https://takoy.blogger.com",
        );
    });

    it("PUT '/api/blogs/{id}' - should give a proper error message to a non-existing id", async () => {
        expect(await dataQueryRepository.returnBloggersAmount()).toBe(3);

        const updatedBlogInput: BlogInputModel = {
            name: "updated name",
            description: "updated description",
            websiteUrl: "https://takoy.blogger.com",
        };

        const res = await request(testApp)
            .put(`${BLOGS_PATH}/0000`)
            .set("Authorization", "Basic " + "YWRtaW46cXdlcnR5")
            .send(updatedBlogInput);
        expect(res.status).toBe(HttpStatus.BadRequest);

        //console.log("test");
    });

    it("PUT '/api/blogs/{id}' - should give a proper error message to an incorrect login/password pair", async () => {
        expect(await dataQueryRepository.returnBloggersAmount()).toBe(3);

        const updatedBlogInput: BlogInputModel = {
            name: "updated name",
            description: "updated description",
            websiteUrl: "https://takoy.blogger.com",
        };

        const res = await request(testApp)
            .put(`${BLOGS_PATH}/001`)
            .set("Authorization", "Basic " + "1111111")
            .send(updatedBlogInput);
        expect(res.status).toBe(HttpStatus.Unauthorized);

        const anotherRes = await request(testApp)
            .put(`${BLOGS_PATH}/001`)
            .set("Authorization", "1111111 " + "YWRtaW46cXdlcnR5")
            .send(updatedBlogInput);
        expect(anotherRes.status).toBe(HttpStatus.Unauthorized);
    });

    it("DELETE '/api/blogs/{id}' - shouldn't be able to delete a blog because of incorrect login/password pair", async () => {
        expect(await dataQueryRepository.returnBloggersAmount()).toBe(3);

        const res = await request(testApp)
            .delete(`${BLOGS_PATH}/001`)
            .set("Authorization", "Basic " + "1111111");
        expect(res.status).toBe(HttpStatus.Unauthorized);
        expect(await dataQueryRepository.returnBloggersAmount()).toBe(3);

        const anotherRes = await request(testApp)
            .delete(`${BLOGS_PATH}/001`)
            .set("Authorization", "1111111 " + "YWRtaW46cXdlcnR5");
        expect(anotherRes.status).toBe(HttpStatus.Unauthorized);
        expect(await dataQueryRepository.returnBloggersAmount()).toBe(3);
    });

    it("DELETE '/api/blogs/{id}' - should delete a blog", async () => {
        expect(await dataQueryRepository.returnBloggersAmount()).toBe(3);

        const res = await request(testApp)
            .delete(`${BLOGS_PATH}/${blogId_1}`)
            .set("Authorization", "Basic " + "YWRtaW46cXdlcnR5");
        expect(await dataQueryRepository.returnBloggersAmount()).toBe(2);
    });

    it("DELETE '/api/blogs/{id}' - shouldn't be able to find non-existent blog entry, should give a proper return-code", async () => {
        expect(await dataQueryRepository.returnBloggersAmount()).toBe(2);

        const anotherResults = await request(testApp).get(
            `${BLOGS_PATH}/${blogId_1}`,
        );
        expect(anotherResults.status).toBe(HttpStatus.NotFound);
    });

    it("Clears the database before quitting unit testing", async () => {
        const res = await request(testApp).delete(`${TESTING_PATH}/all-data`);
        expect(res.status).toBe(204);
    });

    // // the following was done to test and visually see how data in mongo db are represented
    // it("Creating test base entries, directly without endpoint calls", async () => {
    //
    //     const newBlog_1: BlogInputModel = {
    //         name: "blogger_001",
    //         description: "takoy sebe blogger...",
    //         websiteUrl: "https://takoy.blogger.com",
    //     }
    //     const insertedBlog_1 = await dataCommandRepository.createNewBlog(newBlog_1);
    //     blogId_1 = insertedBlog_1.id;
    //
    //     const newPost_1: PostInputModel = {
    //         title: "post blog 001",
    //         shortDescription: "post ni o 4em",
    //         content: "Eto testovoe napolnenie posta 001_001",
    //         blogId: blogId_1,
    //     }
    //     await dataCommandRepository.createNewPost(newPost_1);
    //
    //     const newPost_2 =    {
    //         title: "post blog 002",
    //         shortDescription: "post ni o 4em",
    //         content: "Eto testovoe napolnenie posta 001_002",
    //         blogId: blogId_1,
    //     }
    //     await dataCommandRepository.createNewPost(newPost_2);
    //
    //     const newBlog_2: BlogInputModel = {
    //         name: "blogger_002",
    //         description: "a eto klassnii blogger!",
    //         websiteUrl: "https://klassnii.blogger.com",
    //     }
    //     const insertedBlog_2 = await dataCommandRepository.createNewBlog(newBlog_2);
    //     blogId_2 = insertedBlog_2.id;
    //
    //     const newPost_3: PostInputModel = {
    //         title: "post blog 001",
    //         shortDescription: "horowii post",
    //         content: "Eto testovoe napolnenie posta 002_001",
    //         blogId: blogId_2,
    //     }
    //     await dataCommandRepository.createNewPost(newPost_3);
    //
    //     const newPost_4: PostInputModel = {
    //         title: "post blog 002",
    //         shortDescription: "horowii post",
    //         content: "Eto testovoe napolnenie posta 002_002",
    //         blogId: blogId_2,
    //     }
    //     await dataCommandRepository.createNewPost(newPost_4);
    // });
});
