import { CommentatorInfo } from "./comment-commentator-info";

export type CommentViewModel = {
    id: string;
    content: string;
    commentatorInfo: CommentatorInfo;
    createdAt: Date;
};
