"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mapSingleBloggerCollectionToViewModel = void 0;
const mapSingleBloggerCollectionToViewModel = (blogInContainer) => {
    return {
        id: blogInContainer._id.toString(),
        name: blogInContainer.name,
        description: blogInContainer.description,
        websiteUrl: blogInContainer.websiteUrl,
        createdAt: blogInContainer.createdAt,
        isMembership: false, // был false
    };
};
exports.mapSingleBloggerCollectionToViewModel = mapSingleBloggerCollectionToViewModel;
