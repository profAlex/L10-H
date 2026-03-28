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
exports.deleteCommentById = exports.updateCommentById = exports.getCommentById = void 0;
const id_names_1 = require("../util-enums/id-names");
const http_statuses_1 = require("../../common/http-statuses/http-statuses");
const query_repository_1 = require("../../repository-layers/query-repository-layer/query-repository");
const command_repository_1 = require("../../repository-layers/command-repository-layer/command-repository");
const comments_service_1 = require("../../service-layer(BLL)/comments-service");
const getCommentById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield query_repository_1.dataQueryRepository.findSingleComment(req.params[id_names_1.IdParamName.CommentId]);
    if (!result) {
        return res.sendStatus(http_statuses_1.HttpStatus.NotFound);
    }
    return res.status(http_statuses_1.HttpStatus.Ok)
        .send(result);
});
exports.getCommentById = getCommentById;
const updateCommentById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // проверка наличия userId в структуре req
    if (!req.user || !req.user.userId) {
        console.error({
            message: "Required parameter is missing: 'req.user or req.user.userId' inside updateCommentById handler",
            field: "'if (!req.user || !req.user.userId)' check failed"
        });
        return res.status(http_statuses_1.HttpStatus.InternalServerError)
            .json({
            message: "Internal server error",
            field: ""
        });
    }
    const result = yield comments_service_1.commentsService.updateComment(req.params[id_names_1.IdParamName.CommentId], req.user.userId, req.body);
    if (result.statusCode !== http_statuses_1.HttpStatus.NoContent) {
        return res.status(result.statusCode)
            .json(result.errorsMessages);
    }
    return res.sendStatus(result.statusCode);
});
exports.updateCommentById = updateCommentById;
const deleteCommentById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // проверка наличия userId в структуре req
    if (!req.user || !req.user.userId) {
        console.error({
            message: "Required parameter is missing: 'req.user or req.user.userId' inside deleteCommentById handler",
            field: "'if (!req.user || !req.user.userId)' check failed"
        });
        return res.status(http_statuses_1.HttpStatus.InternalServerError)
            .json({
            message: "Internal server error",
            field: ""
        });
    }
    const result = yield command_repository_1.dataCommandRepository.deleteCommentById(req.params[id_names_1.IdParamName.CommentId], req.user.userId);
    if (result.statusCode !== http_statuses_1.HttpStatus.NoContent) {
        return res.status(result.statusCode)
            .json(result.errorsMessages);
    }
    return res.sendStatus(result.statusCode);
});
exports.deleteCommentById = deleteCommentById;
