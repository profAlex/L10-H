import { HttpStatus } from "../http-statuses/http-statuses";

export type CustomResult<InheretedDataType = null> = {
    data: InheretedDataType | null;
    statusCode: HttpStatus;
    statusDescription?: string;
    errorsMessages: [{ field: string | null; message: string | null }];
};
