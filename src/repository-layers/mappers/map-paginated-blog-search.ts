import {WithId} from "mongodb";
import {BlogViewModel} from "../../routers/router-types/blog-view-model";
import {PaginatedBlogViewModel} from "../../routers/router-types/blog-paginated-view-model";


export function mapToBlogListPaginatedOutput(
    blogs: WithId<BlogViewModel>[],
    metaData: { pageNumber: number; pageSize: number; totalCount: number },
): PaginatedBlogViewModel {
    return {
        pagesCount: Math.ceil(metaData.totalCount / metaData.pageSize),
        page: metaData.pageNumber,
        pageSize: metaData.pageSize,
        totalCount: metaData.totalCount,

        items: blogs.map(
            (blog): BlogViewModel => ({
                id: blog._id.toString(),
                name: blog.name,
                description: blog.description,
                websiteUrl: blog.websiteUrl,
                createdAt: blog.createdAt,
                isMembership: blog.isMembership,
            }),
        ),
    };
}