import {UserViewModel} from "./user-view-model";

export type PaginatedUserViewModel = {
    pagesCount: number;
    page: number;
    pageSize: number;
    totalCount: number;
    items: UserViewModel[];
}