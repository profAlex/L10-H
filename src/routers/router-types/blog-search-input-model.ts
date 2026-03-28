import {BlogsSortListEnum} from "../util-enums/fields-for-sorting";
import {CustomSortDirection} from "../util-enums/sort-direction";

export type InputGetBlogsQuery = {
    searchNameTerm: string | null;
    sortBy: BlogsSortListEnum;
    sortDirection: CustomSortDirection;
    pageNumber: number;
    pageSize: number;
}

