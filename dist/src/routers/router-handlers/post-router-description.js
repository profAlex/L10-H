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
exports.createNewComment = exports.deletePost = exports.updatePost = exports.findSinglePost = exports.createNewPost = exports.getSeveralPosts = exports.getSeveralCommentsByPostId = void 0;
const http_statuses_1 = require("../../common/http-statuses/http-statuses");
const posts_service_1 = require("../../service-layer(BLL)/posts-service");
const express_validator_1 = require("express-validator");
const query_repository_1 = require("../../repository-layers/query-repository-layer/query-repository");
const id_names_1 = require("../util-enums/id-names");
const getSeveralCommentsByPostId = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const sanitizedQuery = (0, express_validator_1.matchedData)(req, {
        locations: ["query"],
        includeOptionals: true,
    }); //утилита для извечения трансформированных значений после валидатара
    //в req.query остаются сырые квери параметры (строки)
    const postId = req.params[id_names_1.IdParamName.PostId];
    if (!postId) {
        console.error("postId seems to be missing in Request inside getSeveralPostsFromBlog, even though it successfully passed middleware checks");
        return res.status(http_statuses_1.HttpStatus.InternalServerError).json({
            error: "Internal Server Error",
        }); // какие-то коды надо передавать, чтобы пользователи могли сообщать их техподдержке
    }
    const commentsListOutput = yield query_repository_1.dataQueryRepository.getSeveralCommentsByPostId(postId, sanitizedQuery);
    return res.status(http_statuses_1.HttpStatus.Ok).send(commentsListOutput);
});
exports.getSeveralCommentsByPostId = getSeveralCommentsByPostId;
const getSeveralPosts = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const sanitizedQuery = (0, express_validator_1.matchedData)(req, {
        locations: ["query"],
        includeOptionals: true,
    }); //утилита для извечения трансформированных значений после валидатара
    //в req.query остаются сырые квери параметры (строки)
    const postsListOutput = yield query_repository_1.dataQueryRepository.getSeveralPosts(sanitizedQuery);
    res.status(http_statuses_1.HttpStatus.Ok).send(postsListOutput);
});
exports.getSeveralPosts = getSeveralPosts;
// немного другой способ создания поста, делает то же что и createNewBlogPost, но другой способ передачи blog ID
const createNewPost = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const insertedId = yield posts_service_1.postsService.createNewPost(req.body);
    if (insertedId) {
        // а вот здесь уже идем в dataQueryRepo с айдишником который нам вернул dataCommandRepo -
        // это нарушение CQRS? Надо сделать такой же метод в dataCommandRepo или надо еще выше поднимать
        // insertedId и делать отдельный хэндлер?
        const result = yield query_repository_1.dataQueryRepository.findSinglePost(insertedId);
        if (result) {
            res.status(http_statuses_1.HttpStatus.Created).json(result);
            return;
        }
    }
    res.status(http_statuses_1.HttpStatus.InternalServerError).send("Unknown error while attempting to create new post or couldn't return created post from Query Database.");
    return;
});
exports.createNewPost = createNewPost;
const findSinglePost = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const postId = typeof req.params[id_names_1.IdParamName.PostId] === 'string' ? req.params[id_names_1.IdParamName.PostId] : req.params[id_names_1.IdParamName.PostId][0];
    const result = yield query_repository_1.dataQueryRepository.findSinglePost(postId);
    if (result === undefined) {
        res.sendStatus(http_statuses_1.HttpStatus.NotFound);
    }
    res.status(http_statuses_1.HttpStatus.Ok).json(result);
});
exports.findSinglePost = findSinglePost;
const updatePost = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const postId = typeof req.params[id_names_1.IdParamName.PostId] === 'string' ? req.params[id_names_1.IdParamName.PostId] : req.params[id_names_1.IdParamName.PostId][0];
    const result = yield posts_service_1.postsService.updatePost(postId, req.body);
    if (result === undefined) {
        res.sendStatus(http_statuses_1.HttpStatus.NotFound);
    }
    res.sendStatus(http_statuses_1.HttpStatus.NoContent);
});
exports.updatePost = updatePost;
const deletePost = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const postId = typeof req.params[id_names_1.IdParamName.PostId] === 'string' ? req.params[id_names_1.IdParamName.PostId] : req.params[id_names_1.IdParamName.PostId][0];
    const result = yield posts_service_1.postsService.deletePost(postId);
    if (result === undefined) {
        res.sendStatus(http_statuses_1.HttpStatus.NotFound);
    }
    res.sendStatus(http_statuses_1.HttpStatus.NoContent);
});
exports.deletePost = deletePost;
const createNewComment = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // проверка параметра URL: postId
    const postId = req.params[id_names_1.IdParamName.PostId];
    // if (!postId) {
    //     console.error({
    //         message:
    //             "Missing required parameter: postId inside createNewComment handler",
    //         field: "'if (!postId)' check failed",
    //     });
    //
    //     return res.status(HttpStatus.InternalServerError).json({errorsMessages: [{
    //         message: "Internal server error",
    //         field: "",
    //     }]});
    // }
    //
    // // проверка, что postId — валидная строка (не пустая)
    // if (typeof postId !== "string" || postId.trim().length === 0) {
    //     console.error({
    //         message:
    //             "Required parameter has incorrect format: 'postId' inside createNewComment handler",
    //         field: "'if (typeof postId !== \"string\" || postId.trim().length === 0)' check failed",
    //     });
    //
    //     return res.status(HttpStatus.InternalServerError).json({errorsMessages: [{
    //         message: "Internal server error",
    //         field: "",
    //     }]});
    // }
    //
    // if (!req.body) {
    //     console.error({
    //         message:
    //             "Required parameter is missing: 'req.body' inside createNewComment handler",
    //         field: "'if (!req.body) ' check failed",
    //     });
    //
    //     return res.status(HttpStatus.InternalServerError).json({errorsMessages: [{
    //         message: "Internal server error",
    //         field: "",
    //     }]});
    // }
    // // проверка тела запроса: content
    const { content } = req.body;
    // if (!content) {
    //     console.error({
    //         message:
    //             "Required parameter is missing: 'content' inside createNewComment handler",
    //         field: "'if (!content) ' check failed",
    //     });
    //
    //     return res.status(HttpStatus.InternalServerError).json({errorsMessages: [{
    //         message: "Internal server error",
    //         field: "",
    //     }]});
    // }
    //
    // // проверка, что content — валидная строка (не пустая)
    // if (typeof content !== "string" || content.trim().length === 0) {
    //     console.error({
    //         message:
    //             "Required parameter has incorrect format: 'content' inside createNewComment handler",
    //         field: "'if (typeof content !== \"string\" || content.trim().length === 0)' check failed",
    //     });
    //
    //     return res.status(HttpStatus.InternalServerError).json({errorsMessages: [{
    //         message: "Internal server error",
    //         field: "",
    //     }]});
    // }
    // проверка наличия userId в структуре req
    if (!req.user || !req.user.userId) {
        console.error({
            message: "Required parameter is missing: 'req.user or req.user.userId' inside createNewComment handler",
            field: "'if (!req.user || !req.user.userId)' check failed",
        });
        return res.status(http_statuses_1.HttpStatus.InternalServerError).json({ errorsMessages: [{
                    message: "Internal server error",
                    field: "",
                }] });
    }
    const userId = req.user.userId;
    if (userId.trim().length === 0) {
        console.error({
            message: "Required parameter has incorrect format: 'req.user.userId' inside createNewComment handler",
            field: "'if (typeof userId !== \"string\" || userId.trim().length === 0)' check failed",
        });
        return res.status(http_statuses_1.HttpStatus.InternalServerError).json({ errorsMessages: [{
                    message: "Internal server error",
                    field: "",
                }] });
    }
    const newCommentResult = yield posts_service_1.postsService.createNewComment(postId, content, userId);
    if (!newCommentResult.data) {
        console.error("Error description: ", newCommentResult === null || newCommentResult === void 0 ? void 0 : newCommentResult.statusDescription, JSON.stringify(newCommentResult.errorsMessages));
        return res.status(newCommentResult.statusCode).json({ errorsMessages: newCommentResult.errorsMessages });
    }
    return res.status(newCommentResult.statusCode).send(newCommentResult.data);
});
exports.createNewComment = createNewComment;
