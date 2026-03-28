import express, { Request, Response, Express } from "express";
import cookieParser from "cookie-parser";
import {
    AUTH_PATH,
    BLOGS_PATH,
    COMMENTS_PATH,
    POSTS_PATH, SECURITY_DEVICES_PATH,
    TESTING_PATH,
    USERS_PATH
} from "./routers/pathes/router-pathes";
import { blogsRouter } from "./routers/blogs-router";
import { postsRouter } from "./routers/posts-router";
import { testingRouter } from "./routers/testing-router";
import { authRouter } from "./routers/auth-router";
import { usersRouter } from "./routers/users-router";
import { commentsRouter } from "./routers/comments-router";
import { securityDevicesRouter } from "./routers/security-devices-router";

export const setupApp = (app: Express) => {
    app.use(express.json());
    app.use(cookieParser());

    app.use(BLOGS_PATH, blogsRouter);
    app.use(POSTS_PATH, postsRouter);
    app.use(TESTING_PATH, testingRouter);
    app.use(AUTH_PATH, authRouter);
    app.use(USERS_PATH, usersRouter);
    app.use(COMMENTS_PATH, commentsRouter);
    app.use(SECURITY_DEVICES_PATH, securityDevicesRouter);

    app.get("/", (req: Request, res: Response) => {
        res.status(200).send("All good!");
    });

    return app;
};
