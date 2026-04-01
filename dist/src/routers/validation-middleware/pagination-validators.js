"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.inputPaginationValidatorForBlogs = inputPaginationValidatorForBlogs;
exports.inputPaginationValidatorForPosts = inputPaginationValidatorForPosts;
exports.inputPaginationValidatorForUsers = inputPaginationValidatorForUsers;
exports.inputPaginationValidatorForComments = inputPaginationValidatorForComments;
const express_validator_1 = require("express-validator");
const sort_direction_1 = require("../util-enums/sort-direction");
const error_handling_helpers_1 = require("./error-handling-helpers");
const DEFAULT_PAGE_NUMBER = 1;
const DEFAULT_PAGE_SIZE = 10;
const DEFAULT_SORT_BY = "createdAt";
const DEFAULT_SORT_DIRECTION = sort_direction_1.CustomSortDirection.Descending;
function inputPaginationValidatorForBlogs(sentListOfAllowedFields) {
    const listOfAllowedFields = Object.values(sentListOfAllowedFields);
    return [
        (0, express_validator_1.query)("sortBy")
            .default(DEFAULT_SORT_BY)
            .isIn(listOfAllowedFields)
            //.withMessage(`Invalid sortBy field. Must be one of the following: ${listOfAllowedFields.join(', ')}`),
            .withMessage((value) => {
            (0, error_handling_helpers_1.customErrorInQueryMessage)(`Invalid sortBy field. Must be one of the following: ${listOfAllowedFields.join(", ")}`, `${value}`);
        }),
        (0, express_validator_1.query)("sortDirection")
            .default(DEFAULT_SORT_DIRECTION)
            .isIn(Object.values(sort_direction_1.CustomSortDirection))
            .withMessage(`Invalid sortDirection field. Must be one of the following: ${Object.values(sort_direction_1.CustomSortDirection).join(", ")}`),
        (0, express_validator_1.query)("pageNumber")
            .default(DEFAULT_PAGE_NUMBER)
            .isInt({ min: 1 })
            .withMessage("Page number must be a positive integer")
            .toInt(),
        (0, express_validator_1.query)("pageSize")
            .default(DEFAULT_PAGE_SIZE)
            .isInt({ min: 1, max: 100 })
            .withMessage("Page size must be a positive integer between 1 and 100")
            .toInt(),
        (0, express_validator_1.query)("searchNameTerm")
            .default(null) // если параметр searchNameTerm отсутствует в запросе то будет подставлено значение null
            .custom((value) => {
            return value === null || typeof value === "string";
        })
            .withMessage("Invalid type of searchNameTerm field. Search terms must be a string or null"),
    ];
}
function inputPaginationValidatorForPosts(sentListOfAllowedFields) {
    const listOfAllowedFields = Object.values(sentListOfAllowedFields);
    return [
        (0, express_validator_1.query)("sortBy")
            .default(DEFAULT_SORT_BY)
            .isIn(listOfAllowedFields)
            .withMessage(`Invalid sortBy field. Must be one of the following: ${listOfAllowedFields.join(", ")}`),
        (0, express_validator_1.query)("sortDirection")
            .default(DEFAULT_SORT_DIRECTION)
            .isIn(Object.values(sort_direction_1.CustomSortDirection))
            .withMessage(`Invalid sortDirection field. Must be one of the following: ${Object.values(sort_direction_1.CustomSortDirection).join(", ")}`),
        (0, express_validator_1.query)("pageNumber")
            .default(DEFAULT_PAGE_NUMBER)
            .isInt({ min: 1 })
            .withMessage("Page number must be a positive integer")
            .toInt(),
        (0, express_validator_1.query)("pageSize")
            .default(DEFAULT_PAGE_SIZE)
            .isInt({ min: 1, max: 100 })
            .withMessage("Page size must be a positive integer between 1 and 100")
            .toInt(),
    ];
}
function inputPaginationValidatorForUsers(sentListOfAllowedFields) {
    const listOfAllowedFields = Object.values(sentListOfAllowedFields);
    return [
        (0, express_validator_1.query)("sortBy")
            .default(DEFAULT_SORT_BY)
            .isIn(listOfAllowedFields)
            .withMessage(`Invalid sortBy field. Must be one of the following: ${listOfAllowedFields.join(", ")}`),
        (0, express_validator_1.query)("sortDirection")
            .default(DEFAULT_SORT_DIRECTION)
            .isIn(Object.values(sort_direction_1.CustomSortDirection))
            .withMessage(`Invalid sortDirection field. Must be one of the following: ${Object.values(sort_direction_1.CustomSortDirection).join(", ")}`),
        (0, express_validator_1.query)("pageNumber")
            .default(DEFAULT_PAGE_NUMBER)
            .isInt({ min: 1 })
            .withMessage("Page number must be a positive integer")
            .toInt(),
        (0, express_validator_1.query)("pageSize")
            .default(DEFAULT_PAGE_SIZE)
            .isInt({ min: 1, max: 100 })
            .withMessage("Page size must be a positive integer between 1 and 100")
            .toInt(),
        (0, express_validator_1.query)("searchLoginTerm")
            .default(null) // если параметр searchLoginTerm отсутствует в запросе то будет подставлено значение null
            .custom((value) => {
            return value === null || typeof value === "string";
        })
            .withMessage("Invalid type of searchLoginTerm field. Search terms must be a string or null"),
        (0, express_validator_1.query)("searchEmailTerm")
            .default(null) // если параметр searchEmailTerm отсутствует в запросе то будет подставлено значение null
            .custom((value) => {
            return value === null || typeof value === "string";
        })
            .withMessage("Invalid type of searchEmailTerm field. Search terms must be a string or null"),
    ];
}
function inputPaginationValidatorForComments(sentListOfAllowedFields) {
    const listOfAllowedFields = Object.values(sentListOfAllowedFields);
    return [
        (0, express_validator_1.query)("sortBy")
            .default(DEFAULT_SORT_BY)
            .isIn(listOfAllowedFields)
            .withMessage(`Invalid sortBy field. Must be one of the following: ${listOfAllowedFields.join(", ")}`),
        (0, express_validator_1.query)("sortDirection")
            .default(DEFAULT_SORT_DIRECTION)
            .isIn(Object.values(sort_direction_1.CustomSortDirection))
            .withMessage(`Invalid sortDirection field. Must be one of the following: ${Object.values(sort_direction_1.CustomSortDirection).join(", ")}`),
        (0, express_validator_1.query)("pageNumber")
            .default(DEFAULT_PAGE_NUMBER)
            .isInt({ min: 1 })
            .withMessage("Page number must be a positive integer")
            .toInt(),
        (0, express_validator_1.query)("pageSize")
            .default(DEFAULT_PAGE_SIZE)
            .isInt({ min: 1, max: 100 })
            .withMessage("Page size must be a positive integer between 1 and 100")
            .toInt(),
    ];
}
