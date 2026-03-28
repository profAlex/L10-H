import { CommentViewModel } from "./comment-view-model";

export type PaginatedCommentViewModel = {
    pagesCount: number;
    page: number;
    pageSize: number;
    totalCount: number;
    items: CommentViewModel[];
};
