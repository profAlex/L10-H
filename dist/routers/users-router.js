"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.usersRouter = void 0;
const express_1 = require("express");
const pagination_validators_1 = require("./validation-middleware/pagination-validators");
const fields_for_sorting_1 = require("./util-enums/fields-for-sorting");
const error_management_validation_middleware_1 = require("./validation-middleware/error-management-validation-middleware");
const base64_auth_guard_middleware_1 = require("./validation-middleware/base64-auth-guard_middleware");
const user_router_description_1 = require("./router-handlers/user-router-description");
const UserInputModel_validation_middleware_1 = require("./validation-middleware/UserInputModel-validation-middleware");
const id_verification_and_validation_1 = require("./validation-middleware/id-verification-and-validation");
const id_names_1 = require("./util-enums/id-names");
const collection_names_1 = require("../db/collection-names");
exports.usersRouter = (0, express_1.Router)();
const validateUserId = (0, id_verification_and_validation_1.createIdValidator)(id_names_1.IdParamName.UserId, collection_names_1.CollectionNames.Users);
exports.usersRouter.get("/", base64_auth_guard_middleware_1.superAdminGuardMiddleware, (0, pagination_validators_1.inputPaginationValidatorForUsers)(fields_for_sorting_1.UsersSortListEnum), error_management_validation_middleware_1.inputErrorManagementMiddleware, user_router_description_1.getSeveralUsers);
exports.usersRouter.post("/", base64_auth_guard_middleware_1.superAdminGuardMiddleware, UserInputModel_validation_middleware_1.userInputModelValidation, error_management_validation_middleware_1.inputErrorManagementMiddleware, user_router_description_1.createNewUser);
exports.usersRouter.delete(`/:${id_names_1.IdParamName.UserId}`, // было просто :id
base64_auth_guard_middleware_1.superAdminGuardMiddleware, validateUserId, error_management_validation_middleware_1.inputErrorManagementMiddleware, user_router_description_1.deleteUser);
