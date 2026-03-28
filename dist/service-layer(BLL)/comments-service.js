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
exports.commentsService = void 0;
const http_statuses_1 = require("../common/http-statuses/http-statuses");
const command_repository_1 = require("../repository-layers/command-repository-layer/command-repository");
const mongodb_1 = require("mongodb");
exports.commentsService = {
    updateComment(sentCommentId, sentUserId, sentContent) {
        return __awaiter(this, void 0, void 0, function* () {
            const comment = yield (0, command_repository_1.findCommentByPrimaryKey)(new mongodb_1.ObjectId(sentCommentId));
            // проверяем что коммент существует
            if (!comment) {
                return {
                    data: null,
                    statusCode: http_statuses_1.HttpStatus.InternalServerError,
                    statusDescription: `Comment is not found by sent comment ID ${sentCommentId} inside dataCommandRepository.updateCommentById. Even though this exact ID passed existence check in middlewares previously.`,
                    errorsMessages: [
                        {
                            field: "if (!comment) inside dataCommandRepository.updateCommentById", // это служебная и отладочная информация, к ней НЕ должен иметь доступ фронтенд, обрабатываем внутри периметра работы бэкэнда
                            message: `Internal Server Error`
                        }
                    ]
                };
            }
            // проверяем что коммент принадлежит юзеру, который пытается его исправить
            if (sentUserId !== comment.commentatorInfo.userId) {
                return {
                    data: null,
                    statusCode: http_statuses_1.HttpStatus.Forbidden,
                    statusDescription: `User is forbidden to change another user’s comment`,
                    errorsMessages: [
                        {
                            field: "if (sentUserId !== comment.commentatorInfo.userId) inside dataCommandRepository.updateCommentById", // это служебная и отладочная информация, к ней НЕ должен иметь доступ фронтенд, обрабатываем внутри периметра работы бэкэнда
                            message: `User is forbidden to change another user’s comment`
                        }
                    ]
                };
            }
            return yield command_repository_1.dataCommandRepository.updateCommentById(sentCommentId, sentContent);
        });
    }
};
