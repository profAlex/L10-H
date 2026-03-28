import { body } from "express-validator";

const contentValidation = body("content")
    .exists()
    .withMessage("Field content must be specified")
    .isString()
    .withMessage("Incorrect content type (must be string)")
    .trim()
    .isLength({ min: 20, max: 300 })
    .withMessage("Field's content length must be between 1 and 1000 symbols");

export const commentInputModelValidation = [contentValidation];
