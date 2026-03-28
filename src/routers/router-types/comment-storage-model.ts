import { CommentatorInfo } from "./comment-commentator-info";
import { ObjectId } from "mongodb";

export type CommentStorageModel = {
    _id: ObjectId;
    id: string;
    relatedPostId: string;
    content: string;
    commentatorInfo: CommentatorInfo;
    createdAt: Date;
};
