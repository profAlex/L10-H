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
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteBlog = exports.updateBlog = exports.findSingleBlog = exports.createNewBlogPost = exports.getSeveralPostsFromBlog = exports.createNewBlog = exports.getSeveralBlogs = void 0;
const http_statuses_1 = require("../../common/http-statuses/http-statuses");
const blogs_service_1 = require("../../service-layer(BLL)/blogs-service");
const express_validator_1 = require("express-validator");
const query_repository_1 = require("../../repository-layers/query-repository-layer/query-repository");
const id_names_1 = require("../util-enums/id-names");
const getSeveralBlogs = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const sanitizedQuery = (0, express_validator_1.matchedData)(req, {
        locations: ["query"],
        includeOptionals: true,
    }); //утилита для извечения трансформированных значений после валидатара
    //в req.query остаются сырые квери параметры (строки)
    const driversListOutput = yield query_repository_1.dataQueryRepository.getSeveralBlogs(sanitizedQuery);
    res.status(http_statuses_1.HttpStatus.Ok).send(driversListOutput);
    return;
});
exports.getSeveralBlogs = getSeveralBlogs;
const createNewBlog = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const insertedId = yield blogs_service_1.blogsService.createNewBlog(req.body);
    if (insertedId) {
        // а вот здесь уже идем в query repo с айдишником который нам вернул command repo
        const result = yield query_repository_1.dataQueryRepository.findSingleBlog(insertedId);
        if (result) {
            res.status(http_statuses_1.HttpStatus.Created).json(result);
            return;
        }
    }
    res.status(http_statuses_1.HttpStatus.InternalServerError).send("Unknown error while attempting to create new blog or couldn't return created blog from Query Database.");
    return;
});
exports.createNewBlog = createNewBlog;
const getSeveralPostsFromBlog = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const sanitizedQuery = (0, express_validator_1.matchedData)(req, {
        locations: ["query"],
        includeOptionals: true,
    }); //утилита для извечения трансформированных значений после валидатара
    //в req.query остаются сырые квери параметры (строки)
    const blogId = req.params[id_names_1.IdParamName.BlogId];
    if (!blogId) {
        console.error("blogId seems to be missing in Request inside getSeveralPostsFromBlog, even though it successfully passed middleware checks");
        return res.status(http_statuses_1.HttpStatus.InternalServerError).json({
            error: "Internal Server Error",
        }); // какие-то коды надо передавать, чтобы пользователи могли сообщать их техподдержке
    }
    const postListOutput = yield query_repository_1.dataQueryRepository.getSeveralPostsById(blogId, sanitizedQuery);
    res.status(http_statuses_1.HttpStatus.Ok).send(postListOutput);
    return;
});
exports.getSeveralPostsFromBlog = getSeveralPostsFromBlog;
const createNewBlogPost = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // const insertedId = await blogsService.createNewBlog(req.body);
    const insertedId = yield blogs_service_1.blogsService.createNewBlogPost(req.params[id_names_1.IdParamName.BlogId], req.body);
    if (insertedId) {
        // а вот здесь уже идем в query repo с айдишником который нам вернул command repo
        // это нарушение CQRS? Надо сделать такой же метод в dataCommandRepo или надо еще выше поднимать
        // insertedId и делать отдельный хэндлер?
        const result = yield query_repository_1.dataQueryRepository.findSinglePost(insertedId);
        if (result) {
            res.status(http_statuses_1.HttpStatus.Created).json(result);
            return;
        }
    }
    res.status(http_statuses_1.HttpStatus.InternalServerError).send("Unknown error while attempting to create new blog-post or couldn't return created blog-post from Query Database.");
    return;
});
exports.createNewBlogPost = createNewBlogPost;
const findSingleBlog = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // console.warn("<-------LOOK ID_3: ", req.params[IdParamName.BlogId]);
    const result = yield query_repository_1.dataQueryRepository.findSingleBlog(req.params[id_names_1.IdParamName.BlogId]);
    // console.warn("<-------ID WAS FOUND??", result);
    if (result === undefined) {
        res.sendStatus(http_statuses_1.HttpStatus.NotFound);
        return;
    }
    res.status(http_statuses_1.HttpStatus.Ok).json(result);
    return;
});
exports.findSingleBlog = findSingleBlog;
const updateBlog = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield blogs_service_1.blogsService.updateBlog(req.params[id_names_1.IdParamName.BlogId], req.body);
    if (result === undefined) {
        res.sendStatus(http_statuses_1.HttpStatus.NotFound);
        return;
    }
    res.sendStatus(http_statuses_1.HttpStatus.NoContent);
    return;
});
exports.updateBlog = updateBlog;
const deleteBlog = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield blogs_service_1.blogsService.deleteBlog(req.params[id_names_1.IdParamName.BlogId]);
    if (result === undefined) {
        res.sendStatus(http_statuses_1.HttpStatus.NotFound);
        return;
    }
    res.sendStatus(http_statuses_1.HttpStatus.NoContent);
    return;
});
exports.deleteBlog = deleteBlog;
