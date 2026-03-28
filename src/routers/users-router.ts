import { Router } from "express";
import { inputPaginationValidatorForUsers } from "./validation-middleware/pagination-validators";
import { UsersSortListEnum } from "./util-enums/fields-for-sorting";
import { inputErrorManagementMiddleware } from "./validation-middleware/error-management-validation-middleware";
import { superAdminGuardMiddleware } from "./validation-middleware/base64-auth-guard_middleware";
import {
    createNewUser,
    deleteUser,
    getSeveralUsers,
} from "./router-handlers/user-router-description";
import { userInputModelValidation } from "./validation-middleware/UserInputModel-validation-middleware";
import { createIdValidator } from "./validation-middleware/id-verification-and-validation";
import { IdParamName } from "./util-enums/id-names";
import { CollectionNames } from "../db/collection-names";

export const usersRouter = Router();

const validateUserId = createIdValidator(
    IdParamName.UserId,
    CollectionNames.Users,
);

usersRouter.get(
    "/",
    superAdminGuardMiddleware,
    inputPaginationValidatorForUsers(UsersSortListEnum),
    inputErrorManagementMiddleware,
    getSeveralUsers,
);
usersRouter.post(
    "/",
    superAdminGuardMiddleware,
    userInputModelValidation,
    inputErrorManagementMiddleware,
    createNewUser,
);
usersRouter.delete(
    `/:${IdParamName.UserId}`, // было просто :id
    superAdminGuardMiddleware,
    validateUserId,
    inputErrorManagementMiddleware,
    deleteUser,
);
