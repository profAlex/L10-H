import { CommentStorageModel } from "../../routers/router-types/comment-storage-model";
import { CommentViewModel } from "../../routers/router-types/comment-view-model";

export const mapSingleCommentToViewModel = (
    commentInContainer: CommentStorageModel,
) => {
    return {
        id: commentInContainer._id.toString(),
        content: commentInContainer.content,
        commentatorInfo: { ...commentInContainer.commentatorInfo },
        createdAt: new Date(commentInContainer.createdAt),
    } as CommentViewModel;
};
