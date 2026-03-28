import { Router } from "express";
import { IdParamName } from "./util-enums/id-names";
import { createIdValidator } from "./validation-middleware/id-verification-and-validation";
import { CollectionNames } from "../db/collection-names";
import { inputErrorManagementMiddleware } from "./validation-middleware/error-management-validation-middleware";
import { commentInputModelValidation } from "./validation-middleware/comment-input-model-validation";
import {
    deleteCommentById,
    getCommentById,
    updateCommentById,
} from "./router-handlers/comment-router-description";
import { accessTokenGuard } from "./guard-middleware/access-token-guard";

export const commentsRouter = Router();

const validateParameterCommentId = createIdValidator(
    IdParamName.CommentId,
    CollectionNames.Comments,
);

commentsRouter.get(
    `/:${IdParamName.CommentId}`,
    validateParameterCommentId,
    //commentInputModelValidation,
    inputErrorManagementMiddleware,
    getCommentById,
);

commentsRouter.put(
    `/:${IdParamName.CommentId}`,
    accessTokenGuard,
    validateParameterCommentId,
    commentInputModelValidation,
    inputErrorManagementMiddleware,
    updateCommentById,
);

commentsRouter.delete(
    `/:${IdParamName.CommentId}`,
    accessTokenGuard,
    validateParameterCommentId,
    deleteCommentById,
);
