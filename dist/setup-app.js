"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupApp = void 0;
const express_1 = __importDefault(require("express"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const router_pathes_1 = require("./routers/pathes/router-pathes");
const blogs_router_1 = require("./routers/blogs-router");
const posts_router_1 = require("./routers/posts-router");
const testing_router_1 = require("./routers/testing-router");
const auth_router_1 = require("./routers/auth-router");
const users_router_1 = require("./routers/users-router");
const comments_router_1 = require("./routers/comments-router");
const security_devices_router_1 = require("./routers/security-devices-router");
const setupApp = (app) => {
    app.use(express_1.default.json());
    app.use((0, cookie_parser_1.default)());
    app.use(router_pathes_1.BLOGS_PATH, blogs_router_1.blogsRouter);
    app.use(router_pathes_1.POSTS_PATH, posts_router_1.postsRouter);
    app.use(router_pathes_1.TESTING_PATH, testing_router_1.testingRouter);
    app.use(router_pathes_1.AUTH_PATH, auth_router_1.authRouter);
    app.use(router_pathes_1.USERS_PATH, users_router_1.usersRouter);
    app.use(router_pathes_1.COMMENTS_PATH, comments_router_1.commentsRouter);
    app.use(router_pathes_1.SECURITY_DEVICES_PATH, security_devices_router_1.securityDevicesRouter);
    app.get("/", (req, res) => {
        res.status(200).send("All good!");
    });
    return app;
};
exports.setupApp = setupApp;
