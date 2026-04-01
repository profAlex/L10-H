"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.commentsRouter = void 0;
const express_1 = require("express");
const id_names_1 = require("./util-enums/id-names");
const id_verification_and_validation_1 = require("./validation-middleware/id-verification-and-validation");
const collection_names_1 = require("../db/collection-names");
const error_management_validation_middleware_1 = require("./validation-middleware/error-management-validation-middleware");
const comment_input_model_validation_1 = require("./validation-middleware/comment-input-model-validation");
const comment_router_description_1 = require("./router-handlers/comment-router-description");
const access_token_guard_1 = require("./guard-middleware/access-token-guard");
exports.commentsRouter = (0, express_1.Router)();
const validateParameterCommentId = (0, id_verification_and_validation_1.createIdValidator)(id_names_1.IdParamName.CommentId, collection_names_1.CollectionNames.Comments);
exports.commentsRouter.get(`/:${id_names_1.IdParamName.CommentId}`, validateParameterCommentId, 
//commentInputModelValidation,
error_management_validation_middleware_1.inputErrorManagementMiddleware, comment_router_description_1.getCommentById);
exports.commentsRouter.put(`/:${id_names_1.IdParamName.CommentId}`, access_token_guard_1.accessTokenGuard, validateParameterCommentId, comment_input_model_validation_1.commentInputModelValidation, error_management_validation_middleware_1.inputErrorManagementMiddleware, comment_router_description_1.updateCommentById);
exports.commentsRouter.delete(`/:${id_names_1.IdParamName.CommentId}`, access_token_guard_1.accessTokenGuard, validateParameterCommentId, comment_router_description_1.deleteCommentById);
