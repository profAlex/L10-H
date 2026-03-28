import { CustomSortDirection } from "../util-enums/sort-direction";
import { CommentsSortListEnum } from "../util-enums/fields-for-sorting";

export type InputGetCommentsQueryModel = {
    sortBy: CommentsSortListEnum;
    sortDirection: CustomSortDirection;
    pageNumber: number;
    pageSize: number;
};
