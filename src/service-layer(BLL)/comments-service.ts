import { HttpStatus } from "../common/http-statuses/http-statuses";
import { CommentInputModel } from "../routers/router-types/comment-input-model";
import {
    dataCommandRepository,
    findCommentByPrimaryKey
} from "../repository-layers/command-repository-layer/command-repository";
import { ObjectId } from "mongodb";
import { CustomResult } from "../common/result-type/result-type";


export const commentsService = {
    async updateComment(
        sentCommentId: string,
        sentUserId: string,
        sentContent: CommentInputModel
    ): Promise<CustomResult>  {

        const comment = await findCommentByPrimaryKey(
            new ObjectId(sentCommentId)
        );

        // проверяем что коммент существует
        if (!comment) {
            return {
                data: null,
                statusCode: HttpStatus.InternalServerError,
                statusDescription: `Comment is not found by sent comment ID ${sentCommentId} inside dataCommandRepository.updateCommentById. Even though this exact ID passed existence check in middlewares previously.`,
                errorsMessages: [
                    {
                        field: "if (!comment) inside dataCommandRepository.updateCommentById", // это служебная и отладочная информация, к ней НЕ должен иметь доступ фронтенд, обрабатываем внутри периметра работы бэкэнда
                        message: `Internal Server Error`
                    }
                ]
            };
        }

        // проверяем что коммент принадлежит юзеру, который пытается его исправить
        if (sentUserId !== comment.commentatorInfo.userId) {
            return {
                data: null,
                statusCode: HttpStatus.Forbidden,
                statusDescription: `User is forbidden to change another user’s comment`,
                errorsMessages: [
                    {
                        field: "if (sentUserId !== comment.commentatorInfo.userId) inside dataCommandRepository.updateCommentById", // это служебная и отладочная информация, к ней НЕ должен иметь доступ фронтенд, обрабатываем внутри периметра работы бэкэнда
                        message: `User is forbidden to change another user’s comment`
                    }
                ]
            };
        }

        return await dataCommandRepository.updateCommentById(
            sentCommentId,
            sentContent
        );
    }
};