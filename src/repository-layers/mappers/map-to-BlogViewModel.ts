import { BlogViewModel } from "../../routers/router-types/blog-view-model";
import { BloggerCollectionStorageModel } from "../command-repository-layer/command-repository";

export const mapSingleBloggerCollectionToViewModel = (
    blogInContainer: BloggerCollectionStorageModel,
) => {
    return {
        id: blogInContainer._id.toString(),
        name: blogInContainer.name,
        description: blogInContainer.description,
        websiteUrl: blogInContainer.websiteUrl,
        createdAt: blogInContainer.createdAt,
        isMembership: false, // был false
    } as BlogViewModel;
};
