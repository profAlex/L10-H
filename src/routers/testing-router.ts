import { Request, Response, Router } from "express";
import { dataCommandRepository } from "../repository-layers/command-repository-layer/command-repository";
import { HttpStatus } from "../common/http-statuses/http-statuses";

export const testingRouter = Router();

testingRouter.delete("/all-data", async (req: Request, res: Response) => {
    await dataCommandRepository.deleteAllBloggers();
    res.sendStatus(HttpStatus.NoContent);
});
