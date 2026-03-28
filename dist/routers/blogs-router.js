"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.blogsRouter = void 0;
const express_1 = require("express");
const blog_router_description_1 = require("./router-handlers/blog-router-description");
const BlogInputModel_validation_middleware_1 = require("./validation-middleware/BlogInputModel-validation-middleware");
const error_management_validation_middleware_1 = require("./validation-middleware/error-management-validation-middleware");
const base64_auth_guard_middleware_1 = require("./validation-middleware/base64-auth-guard_middleware");
const fields_for_sorting_1 = require("./util-enums/fields-for-sorting");
const pagination_validators_1 = require("./validation-middleware/pagination-validators");
const PostInputModel_validation_middleware_1 = require("./validation-middleware/PostInputModel-validation-middleware");
const collection_names_1 = require("../db/collection-names");
const id_verification_and_validation_1 = require("./validation-middleware/id-verification-and-validation");
const id_names_1 = require("./util-enums/id-names");
exports.blogsRouter = (0, express_1.Router)();
const validateBlogId = (0, id_verification_and_validation_1.createIdValidator)(id_names_1.IdParamName.BlogId, collection_names_1.CollectionNames.Blogs);
const validatePostIdForGeneralCRUDEndpoints = (0, id_verification_and_validation_1.createIdValidator)(id_names_1.IdParamName.PostId, collection_names_1.CollectionNames.Blogs);
// Returns blogs with paging
exports.blogsRouter.get("/", (0, pagination_validators_1.inputPaginationValidatorForBlogs)(fields_for_sorting_1.BlogsSortListEnum), error_management_validation_middleware_1.inputErrorManagementMiddleware, blog_router_description_1.getSeveralBlogs);
// auth guarded, Creates new blog
exports.blogsRouter.post("/", base64_auth_guard_middleware_1.superAdminGuardMiddleware, BlogInputModel_validation_middleware_1.blogInputModelValidation, error_management_validation_middleware_1.inputErrorManagementMiddleware, blog_router_description_1.createNewBlog);
// Returns all posts for specified blog
exports.blogsRouter.get(`/:${id_names_1.IdParamName.BlogId}/posts`, validateBlogId, (0, pagination_validators_1.inputPaginationValidatorForPosts)(fields_for_sorting_1.PostsSortListEnum), error_management_validation_middleware_1.inputErrorManagementMiddleware, blog_router_description_1.getSeveralPostsFromBlog);
// auth guarded, Creates new post for specific blog
exports.blogsRouter.post(`/:${id_names_1.IdParamName.BlogId}/posts`, base64_auth_guard_middleware_1.superAdminGuardMiddleware, validateBlogId, PostInputModel_validation_middleware_1.blogRoutesPostInputModelValidation, error_management_validation_middleware_1.inputErrorManagementMiddleware, blog_router_description_1.createNewBlogPost);
// Returns blog by id
exports.blogsRouter.get(`/:blogId`, validateBlogId, error_management_validation_middleware_1.inputErrorManagementMiddleware, blog_router_description_1.findSingleBlog);
// auth guarded, Update existing Blog by id with InputModel
exports.blogsRouter.put(`/:${id_names_1.IdParamName.BlogId}`, base64_auth_guard_middleware_1.superAdminGuardMiddleware, validateBlogId, BlogInputModel_validation_middleware_1.blogInputModelValidation, error_management_validation_middleware_1.inputErrorManagementMiddleware, blog_router_description_1.updateBlog);
// auth guarded, Deletes blog specified by id
exports.blogsRouter.delete(`/:${id_names_1.IdParamName.BlogId}`, base64_auth_guard_middleware_1.superAdminGuardMiddleware, validateBlogId, error_management_validation_middleware_1.inputErrorManagementMiddleware, blog_router_description_1.deleteBlog);
