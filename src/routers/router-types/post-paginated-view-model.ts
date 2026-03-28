import {PostViewModel} from "./post-view-model";

export type PaginatedPostViewModel = {
    pagesCount: number;
    page: number;
    pageSize: number;
    totalCount: number;
    items: PostViewModel[];
}