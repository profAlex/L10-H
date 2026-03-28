import {BlogViewModel} from "./blog-view-model";

export type PaginatedBlogViewModel = {
    pagesCount: number;
    page: number;
    pageSize: number;
    totalCount: number;
    items: BlogViewModel[];
}