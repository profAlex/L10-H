"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.inputErrorManagementMiddleware = void 0;
const http_statuses_1 = require("../../common/http-statuses/http-statuses");
const express_validator_1 = require("express-validator");
const formatErrors = (error) => {
    // Проверяем, является ли ошибка FieldValidationError (path содержится только в FieldValidationError)
    if ("path" in error) {
        const fieldError = error;
        if (typeof fieldError.msg === "object" &&
            fieldError.msg !== null &&
            "message" in fieldError.msg &&
            fieldError.msg.message != null) {
            const customMsg = fieldError.msg;
            return {
                message: String(customMsg.message),
                field: customMsg.field || fieldError.path || "unknown",
            };
        }
        return {
            message: String(fieldError.msg),
            field: fieldError.path || "unknown",
        };
    }
    // Для других типов ошибок (AlternativeValidationError и т. п.)
    return {
        message: String(error.msg),
        field: "unknown", // или другое значение по умолчанию
    };
};
const inputErrorManagementMiddleware = (req, res, next) => {
    const errors = (0, express_validator_1.validationResult)(req)
        .formatWith(formatErrors)
        .array({ onlyFirstError: true });
    if (errors.length > 0) {
        console.log(`Error ${http_statuses_1.HttpStatus.BadRequest}: ${errors[0].message}`);
        return res
            .status(http_statuses_1.HttpStatus.BadRequest)
            .json({ errorsMessages: errors });
    }
    return next();
};
exports.inputErrorManagementMiddleware = inputErrorManagementMiddleware;
