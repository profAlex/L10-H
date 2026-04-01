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
exports.postsService = void 0;
const command_repository_1 = require("../repository-layers/command-repository-layer/command-repository");
const mongodb_1 = require("mongodb");
const http_statuses_1 = require("../common/http-statuses/http-statuses");
exports.postsService = {
    createNewPost(newPost) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield command_repository_1.dataCommandRepository.createNewPost(newPost);
        });
    },
    updatePost(postId, newData) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield command_repository_1.dataCommandRepository.updatePost(postId, newData);
        });
    },
    deletePost(postId) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield command_repository_1.dataCommandRepository.deletePost(postId);
        });
    },
    createNewComment(postId, content, userId) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!mongodb_1.ObjectId.isValid(userId) || !mongodb_1.ObjectId.isValid(postId)) {
                return {
                    data: null,
                    statusCode: http_statuses_1.HttpStatus.InternalServerError,
                    statusDescription: "User ID or Post ID dont look like valid mongo ID. Need to check input data and corresponding user and post records.",
                    errorsMessages: [
                        {
                            field: "createNewComment -> if (!ObjectId.isValid(userId) || !ObjectId.isValid(postId))", // это служебная и отладочная информация, к ней НЕ должен иметь доступ фронтенд, обрабатываем внутри периметра работы бэкэнда
                            message: "User ID or Post ID have invalid format"
                        }
                    ]
                };
            }
            return yield command_repository_1.dataCommandRepository.createNewComment(postId, content, userId);
        });
    },
};
