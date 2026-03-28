"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mapSinglePostCollectionToViewModel = void 0;
const mapSinglePostCollectionToViewModel = (postInContainer) => {
    return {
        id: postInContainer._id.toString(),
        title: postInContainer.title,
        shortDescription: postInContainer.shortDescription,
        content: postInContainer.content,
        blogId: postInContainer.blogId,
        blogName: postInContainer.blogName,
        createdAt: postInContainer.createdAt,
    };
};
exports.mapSinglePostCollectionToViewModel = mapSinglePostCollectionToViewModel;
