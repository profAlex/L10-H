"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.blogsService = void 0;
const command_repository_1 = require("../repository-layers/command-repository-layer/command-repository");
exports.blogsService = {
    // getSeveralBlogs, getSeveralPostsById, findSingleBlog переехал в query-repositary-layer, и в потоке который обрабатывает query отсутствует слой service
    // async getSeveralBlogs(sentInputGetBlogsQuery: InputGetBlogsQuery): Promise<{items: WithId<BlogViewModel>[]; totalCount: number}> {
    //
    //     return await dataCommandRepository.getSeveralBlogs(sentInputGetBlogsQuery);
    // },
    createNewBlog(newBlog) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield command_repository_1.dataCommandRepository.createNewBlog(newBlog);
        });
    },
    createNewBlogPost(sentBlogId, newPost) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield command_repository_1.dataCommandRepository.createNewBlogPost(sentBlogId, newPost);
        });
    },
    // async getSeveralPostsById(sentBlogId:string, sentSanitizedQuery: InputGetBlogPostsByIdQuery): Promise<{items: WithId<PostViewModel>[]; totalCount: number}> {
    //
    //     return await dataCommandRepository.getSeveralPostsById(sentBlogId, sentSanitizedQuery);
    // },
    // async findSingleBlog(blogId: string): Promise<BlogViewModel | undefined> {
    //
    //     return await dataCommandRepository.findSingleBlog(blogId);
    // },
    updateBlog(blogId, newData) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield command_repository_1.dataCommandRepository.updateBlog(blogId, newData);
        });
    },
    deleteBlog(blogId) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield command_repository_1.dataCommandRepository.deleteBlog(blogId);
        });
    },
};
