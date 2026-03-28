import { query, ValidationChain } from "express-validator";
import { CustomSortDirection } from "../util-enums/sort-direction";
import { customErrorInQueryMessage } from "./error-handling-helpers";

const DEFAULT_PAGE_NUMBER = 1;
const DEFAULT_PAGE_SIZE = 10;
const DEFAULT_SORT_BY = "createdAt";
const DEFAULT_SORT_DIRECTION = CustomSortDirection.Descending;

export function inputPaginationValidatorForBlogs<T extends string>(
    sentListOfAllowedFields: Record<string, T>,
): ValidationChain[] {
    const listOfAllowedFields = Object.values(sentListOfAllowedFields);

    return [
        query("sortBy")
            .default(DEFAULT_SORT_BY)
            .isIn(listOfAllowedFields)
            //.withMessage(`Invalid sortBy field. Must be one of the following: ${listOfAllowedFields.join(', ')}`),
            .withMessage((value) => {
                customErrorInQueryMessage(
                    `Invalid sortBy field. Must be one of the following: ${listOfAllowedFields.join(", ")}`,
                    `${value}`,
                );
            }),

        query("sortDirection")
            .default(DEFAULT_SORT_DIRECTION)
            .isIn(Object.values(CustomSortDirection))
            .withMessage(
                `Invalid sortDirection field. Must be one of the following: ${Object.values(CustomSortDirection).join(", ")}`,
            ),

        query("pageNumber")
            .default(DEFAULT_PAGE_NUMBER)
            .isInt({ min: 1 })
            .withMessage("Page number must be a positive integer")
            .toInt(),

        query("pageSize")
            .default(DEFAULT_PAGE_SIZE)
            .isInt({ min: 1, max: 100 })
            .withMessage(
                "Page size must be a positive integer between 1 and 100",
            )
            .toInt(),

        query("searchNameTerm")
            .default(null) // если параметр searchNameTerm отсутствует в запросе то будет подставлено значение null
            .custom((value) => {
                return value === null || typeof value === "string";
            })
            .withMessage(
                "Invalid type of searchNameTerm field. Search terms must be a string or null",
            ),
    ];
}

export function inputPaginationValidatorForPosts<T extends string>(
    sentListOfAllowedFields: Record<string, T>,
): ValidationChain[] {
    const listOfAllowedFields = Object.values(sentListOfAllowedFields);

    return [
        query("sortBy")
            .default(DEFAULT_SORT_BY)
            .isIn(listOfAllowedFields)
            .withMessage(
                `Invalid sortBy field. Must be one of the following: ${listOfAllowedFields.join(", ")}`,
            ),

        query("sortDirection")
            .default(DEFAULT_SORT_DIRECTION)
            .isIn(Object.values(CustomSortDirection))
            .withMessage(
                `Invalid sortDirection field. Must be one of the following: ${Object.values(CustomSortDirection).join(", ")}`,
            ),

        query("pageNumber")
            .default(DEFAULT_PAGE_NUMBER)
            .isInt({ min: 1 })
            .withMessage("Page number must be a positive integer")
            .toInt(),

        query("pageSize")
            .default(DEFAULT_PAGE_SIZE)
            .isInt({ min: 1, max: 100 })
            .withMessage(
                "Page size must be a positive integer between 1 and 100",
            )
            .toInt(),
    ];
}

export function inputPaginationValidatorForUsers<T extends string>(
    sentListOfAllowedFields: Record<string, T>,
): ValidationChain[] {
    const listOfAllowedFields = Object.values(sentListOfAllowedFields);

    return [
        query("sortBy")
            .default(DEFAULT_SORT_BY)
            .isIn(listOfAllowedFields)
            .withMessage(
                `Invalid sortBy field. Must be one of the following: ${listOfAllowedFields.join(", ")}`,
            ),

        query("sortDirection")
            .default(DEFAULT_SORT_DIRECTION)
            .isIn(Object.values(CustomSortDirection))
            .withMessage(
                `Invalid sortDirection field. Must be one of the following: ${Object.values(CustomSortDirection).join(", ")}`,
            ),

        query("pageNumber")
            .default(DEFAULT_PAGE_NUMBER)
            .isInt({ min: 1 })
            .withMessage("Page number must be a positive integer")
            .toInt(),

        query("pageSize")
            .default(DEFAULT_PAGE_SIZE)
            .isInt({ min: 1, max: 100 })
            .withMessage(
                "Page size must be a positive integer between 1 and 100",
            )
            .toInt(),

        query("searchLoginTerm")
            .default(null) // если параметр searchLoginTerm отсутствует в запросе то будет подставлено значение null
            .custom((value) => {
                return value === null || typeof value === "string";
            })
            .withMessage(
                "Invalid type of searchLoginTerm field. Search terms must be a string or null",
            ),

        query("searchEmailTerm")
            .default(null) // если параметр searchEmailTerm отсутствует в запросе то будет подставлено значение null
            .custom((value) => {
                return value === null || typeof value === "string";
            })
            .withMessage(
                "Invalid type of searchEmailTerm field. Search terms must be a string or null",
            ),
    ];
}

export function inputPaginationValidatorForComments<T extends string>(
    sentListOfAllowedFields: Record<string, T>,
): ValidationChain[] {
    const listOfAllowedFields = Object.values(sentListOfAllowedFields);

    return [
        query("sortBy")
            .default(DEFAULT_SORT_BY)
            .isIn(listOfAllowedFields)
            .withMessage(
                `Invalid sortBy field. Must be one of the following: ${listOfAllowedFields.join(", ")}`,
            ),

        query("sortDirection")
            .default(DEFAULT_SORT_DIRECTION)
            .isIn(Object.values(CustomSortDirection))
            .withMessage(
                `Invalid sortDirection field. Must be one of the following: ${Object.values(CustomSortDirection).join(", ")}`,
            ),

        query("pageNumber")
            .default(DEFAULT_PAGE_NUMBER)
            .isInt({ min: 1 })
            .withMessage("Page number must be a positive integer")
            .toInt(),

        query("pageSize")
            .default(DEFAULT_PAGE_SIZE)
            .isInt({ min: 1, max: 100 })
            .withMessage(
                "Page size must be a positive integer between 1 and 100",
            )
            .toInt(),
    ];
}
