import {WithId} from "mongodb";
import {PostViewModel} from "../../routers/router-types/post-view-model";
import {PaginatedPostViewModel} from "../../routers/router-types/post-paginated-view-model";


export function mapToPostListPaginatedOutput(
    posts: WithId<PostViewModel>[],
    metaData: { pageNumber: number; pageSize: number; totalCount: number },
): PaginatedPostViewModel {
    return {
        pagesCount: Math.ceil(metaData.totalCount / metaData.pageSize),
        page: metaData.pageNumber,
        pageSize: metaData.pageSize,
        totalCount: metaData.totalCount,

        items: posts.map(
            (post): PostViewModel => ({
                id: post._id.toString(),
                title: post.title,
                shortDescription: post.shortDescription,
                content: post.content,
                blogId: post.blogId,
                blogName: post.blogName,
                createdAt: post.createdAt,
            }),
        ),
    };
}