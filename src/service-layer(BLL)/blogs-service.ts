import {CustomSortDirection} from "../routers/util-enums/sort-direction";
import {Request, Response} from "express";
import {InputGetBlogsQuery} from "../routers/router-types/blog-search-input-model";
import {ObjectId, WithId} from "mongodb";
import {BlogViewModel} from "../routers/router-types/blog-view-model";
import {dataCommandRepository} from "../repository-layers/command-repository-layer/command-repository";
import {InputGetBlogPostsByIdQuery} from "../routers/router-types/blog-search-by-id-input-model";
import {PostViewModel} from "../routers/router-types/post-view-model";
import {BlogInputModel} from "../routers/router-types/blog-input-model";
import {PostInputModel} from "../routers/router-types/post-input-model";



export const blogsService = {
    // getSeveralBlogs, getSeveralPostsById, findSingleBlog переехал в query-repositary-layer, и в потоке который обрабатывает query отсутствует слой service

    // async getSeveralBlogs(sentInputGetBlogsQuery: InputGetBlogsQuery): Promise<{items: WithId<BlogViewModel>[]; totalCount: number}> {
    //
    //     return await dataCommandRepository.getSeveralBlogs(sentInputGetBlogsQuery);
    // },

    async createNewBlog(newBlog: BlogInputModel) : Promise<string | undefined> {

        return await dataCommandRepository.createNewBlog(newBlog);
    },

    async createNewBlogPost(sentBlogId: string, newPost: PostInputModel): Promise<string | undefined> {

        return await dataCommandRepository.createNewBlogPost(sentBlogId, newPost);
    },

    // async getSeveralPostsById(sentBlogId:string, sentSanitizedQuery: InputGetBlogPostsByIdQuery): Promise<{items: WithId<PostViewModel>[]; totalCount: number}> {
    //
    //     return await dataCommandRepository.getSeveralPostsById(sentBlogId, sentSanitizedQuery);
    // },

    // async findSingleBlog(blogId: string): Promise<BlogViewModel | undefined> {
    //
    //     return await dataCommandRepository.findSingleBlog(blogId);
    // },

    async updateBlog (blogId: string, newData: BlogInputModel) {
        return await dataCommandRepository.updateBlog(blogId, newData);
    },

    async deleteBlog (blogId: string) : Promise<null | undefined> {
        return await dataCommandRepository.deleteBlog(blogId);
    },

}