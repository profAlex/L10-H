import { dataCommandRepository } from "../repository-layers/command-repository-layer/command-repository";
import { PostViewModel } from "../routers/router-types/post-view-model";
import { PostInputModel } from "../routers/router-types/post-input-model";
import { CommentViewModel } from "../routers/router-types/comment-view-model";
import { CustomResult } from "../common/result-type/result-type";
import { ObjectId } from "mongodb";
import { HttpStatus } from "../common/http-statuses/http-statuses";

export const postsService = {
    async createNewPost(newPost: PostInputModel): Promise<string | undefined> {
        return await dataCommandRepository.createNewPost(newPost);
    },

    async updatePost(postId: string, newData: PostInputModel) {
        return await dataCommandRepository.updatePost(postId, newData);
    },

    async deletePost(postId: string): Promise<null | undefined> {
        return await dataCommandRepository.deletePost(postId);
    },

    async createNewComment(
        postId: string,
        content: string,
        userId: string,
    ): Promise<CustomResult<CommentViewModel>> {
        if (!ObjectId.isValid(userId) || !ObjectId.isValid(postId))
        {
            return {
                data: null,
                statusCode: HttpStatus.InternalServerError,
                statusDescription:
                    "User ID or Post ID dont look like valid mongo ID. Need to check input data and corresponding user and post records.",
                errorsMessages: [
                    {
                        field: "createNewComment -> if (!ObjectId.isValid(userId) || !ObjectId.isValid(postId))", // это служебная и отладочная информация, к ней НЕ должен иметь доступ фронтенд, обрабатываем внутри периметра работы бэкэнда
                        message: "User ID or Post ID have invalid format"
                    }
                ]
            };
        }

            return await dataCommandRepository.createNewComment(
            postId,
            content,
            userId,
        );
    },
};
