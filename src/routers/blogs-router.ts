import { Request, Response, Router } from "express";
import {
    createNewBlog,
    createNewBlogPost,
    deleteBlog,
    findSingleBlog,
    getSeveralBlogs,
    getSeveralPostsFromBlog,
    updateBlog,
} from "./router-handlers/blog-router-description";
import { blogInputModelValidation } from "./validation-middleware/BlogInputModel-validation-middleware";
import { inputErrorManagementMiddleware } from "./validation-middleware/error-management-validation-middleware";
import { superAdminGuardMiddleware } from "./validation-middleware/base64-auth-guard_middleware";
import {
    BlogsSortListEnum,
    PostsSortListEnum,
} from "./util-enums/fields-for-sorting";
import {
    inputPaginationValidatorForBlogs,
    inputPaginationValidatorForPosts,
} from "./validation-middleware/pagination-validators";
import {
    blogRoutesPostInputModelValidation,
    postInputModelValidation,
} from "./validation-middleware/PostInputModel-validation-middleware";
import { CollectionNames } from "../db/collection-names";
import { createIdValidator } from "./validation-middleware/id-verification-and-validation";
import { InputGetBlogPostsByIdQuery } from "./router-types/blog-search-by-id-input-model";
import { IdParamName } from "./util-enums/id-names";

export const blogsRouter = Router();

const validateBlogId = createIdValidator(
    IdParamName.BlogId,
    CollectionNames.Blogs,
);

const validatePostIdForGeneralCRUDEndpoints = createIdValidator(
    IdParamName.PostId,
    CollectionNames.Blogs,
);

// Returns blogs with paging
blogsRouter.get(
    "/",
    inputPaginationValidatorForBlogs(BlogsSortListEnum),
    inputErrorManagementMiddleware,
    getSeveralBlogs,
);

// auth guarded, Creates new blog
blogsRouter.post(
    "/",
    superAdminGuardMiddleware,
    blogInputModelValidation,
    inputErrorManagementMiddleware,
    createNewBlog,
);

// Returns all posts for specified blog
blogsRouter.get(
    `/:${IdParamName.BlogId}/posts`,
    validateBlogId,
    inputPaginationValidatorForPosts(PostsSortListEnum),
    inputErrorManagementMiddleware,
    getSeveralPostsFromBlog,
);

// auth guarded, Creates new post for specific blog
blogsRouter.post(
    `/:${IdParamName.BlogId}/posts`,
    superAdminGuardMiddleware,
    validateBlogId,
    blogRoutesPostInputModelValidation,
    inputErrorManagementMiddleware,
    createNewBlogPost,
);

// Returns blog by id
blogsRouter.get(
    `/:blogId`,
    validateBlogId,
    inputErrorManagementMiddleware,
    findSingleBlog,
);

// auth guarded, Update existing Blog by id with InputModel
blogsRouter.put(
    `/:${IdParamName.BlogId}`,
    superAdminGuardMiddleware,
    validateBlogId,
    blogInputModelValidation,
    inputErrorManagementMiddleware,
    updateBlog,
);

// auth guarded, Deletes blog specified by id
blogsRouter.delete(
    `/:${IdParamName.BlogId}`,
    superAdminGuardMiddleware,
    validateBlogId,
    inputErrorManagementMiddleware,
    deleteBlog,
);
