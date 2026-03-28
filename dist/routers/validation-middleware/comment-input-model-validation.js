"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.commentInputModelValidation = void 0;
const express_validator_1 = require("express-validator");
const contentValidation = (0, express_validator_1.body)("content")
    .exists()
    .withMessage("Field content must be specified")
    .isString()
    .withMessage("Incorrect content type (must be string)")
    .trim()
    .isLength({ min: 20, max: 300 })
    .withMessage("Field's content length must be between 1 and 1000 symbols");
exports.commentInputModelValidation = [contentValidation];
