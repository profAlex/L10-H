import {BlogsSortListEnum, PostsSortListEnum} from "../util-enums/fields-for-sorting";
import {CustomSortDirection} from "../util-enums/sort-direction";

export type InputGetBlogPostsByIdQuery = {
    sortBy: PostsSortListEnum;
    sortDirection: CustomSortDirection;
    pageNumber: number;
    pageSize: number;
}