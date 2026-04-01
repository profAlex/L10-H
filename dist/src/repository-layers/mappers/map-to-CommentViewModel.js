"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mapSingleCommentToViewModel = void 0;
const mapSingleCommentToViewModel = (commentInContainer) => {
    return {
        id: commentInContainer._id.toString(),
        content: commentInContainer.content,
        commentatorInfo: Object.assign({}, commentInContainer.commentatorInfo),
        createdAt: new Date(commentInContainer.createdAt),
    };
};
exports.mapSingleCommentToViewModel = mapSingleCommentToViewModel;
