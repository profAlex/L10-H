import {PostsSortListEnum} from "../util-enums/fields-for-sorting";
import {CustomSortDirection} from "../util-enums/sort-direction";

export type InputGetUsersQuery = {
    searchLoginTerm: string | null;
    searchEmailTerm: string | null;
    sortBy: PostsSortListEnum;
    sortDirection: CustomSortDirection;
    pageNumber: number;
    pageSize: number;
}