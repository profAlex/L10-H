import { CommentStorageModel } from "../../routers/router-types/comment-storage-model";
import { PaginatedCommentViewModel } from "../../routers/router-types/comment-paginated-view-model";
import { CommentViewModel } from "../../routers/router-types/comment-view-model";

export function mapToCommentListPaginatedOutput(
    comments: CommentStorageModel[],
    metaData: { pageNumber: number; pageSize: number; totalCount: number },
): PaginatedCommentViewModel {
    return {
        pagesCount: Math.ceil(metaData.totalCount / metaData.pageSize),
        page: metaData.pageNumber,
        pageSize: metaData.pageSize,
        totalCount: metaData.totalCount,

        items: comments.map(
            (comment): CommentViewModel => ({
                id: comment._id.toString(),
                content: comment.content,
                commentatorInfo: { ...comment.commentatorInfo },
                createdAt: new Date(comment.createdAt),
            }),
        ),
    };
}
