import { PostViewModel } from "../../routers/router-types/post-view-model";
import { PostCollectionStorageModel } from "../command-repository-layer/command-repository";

export const mapSinglePostCollectionToViewModel = (
    postInContainer: PostCollectionStorageModel,
) => {
    return {
        id: postInContainer._id.toString(),
        title: postInContainer.title,
        shortDescription: postInContainer.shortDescription,
        content: postInContainer.content,
        blogId: postInContainer.blogId,
        blogName: postInContainer.blogName,
        createdAt: postInContainer.createdAt,
    } as PostViewModel;
};
