"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.blogRoutesPostInputModelValidation = exports.postInputModelValidation = void 0;
const express_validator_1 = require("express-validator");
const titleValidation = (0, express_validator_1.body)('title')
    .exists().withMessage('Field title must be specified')
    .isString().withMessage('Incorrect title type (must be string)')
    .trim()
    .isLength({ min: 1, max: 30 }).withMessage('Field\'s title length must be between 1 and 30 symbols');
const shortDescriptionValidation = (0, express_validator_1.body)('shortDescription')
    .exists().withMessage('Field shortDescription must be specified')
    .isString().withMessage('Incorrect shortDescription type (must be string)')
    .trim()
    .isLength({ min: 1, max: 100 }).withMessage('Field\'s shortDescription length must be between 1 and 100 symbols');
const contentValidation = (0, express_validator_1.body)('content')
    .exists().withMessage('Field content must be specified')
    .isString().withMessage('Incorrect content type (must be string)')
    .trim()
    .isLength({ min: 1, max: 1000 }).withMessage('Field\'s content length must be between 1 and 1000 symbols');
const blogIdValidation = (0, express_validator_1.body)('blogId')
    .exists().withMessage('Field blogId must be specified')
    .isString().withMessage('Incorrect blogId type (must be string)')
    .trim();
exports.postInputModelValidation = [
    titleValidation,
    shortDescriptionValidation,
    contentValidation,
    blogIdValidation
];
exports.blogRoutesPostInputModelValidation = [
    titleValidation,
    shortDescriptionValidation,
    contentValidation,
];
