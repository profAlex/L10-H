"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mapToCommentListPaginatedOutput = mapToCommentListPaginatedOutput;
function mapToCommentListPaginatedOutput(comments, metaData) {
    return {
        pagesCount: Math.ceil(metaData.totalCount / metaData.pageSize),
        page: metaData.pageNumber,
        pageSize: metaData.pageSize,
        totalCount: metaData.totalCount,
        items: comments.map((comment) => ({
            id: comment._id.toString(),
            content: comment.content,
            commentatorInfo: Object.assign({}, comment.commentatorInfo),
            createdAt: new Date(comment.createdAt),
        })),
    };
}
