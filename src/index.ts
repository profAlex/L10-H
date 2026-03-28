import { setupApp } from "./setup-app";
import { closeDB, runDB } from "./db/mongo.db";
import { envConfig } from "./config";
import { TESTING_PATH } from "./routers/pathes/router-pathes";
import express, { Request, Response, Express } from "express";

const app = express();
setupApp(app);
app.set('trust proxy', true); // для получения корректного ip-адреса из req.ip необходимо вызвать

const PORT = envConfig.appPort;

export const startApp = async () => {
  await runDB();

  app.listen(PORT, () => {
    console.log(`Server started on port ${PORT}`);
  });
};

startApp();

process.on('SIGINT', async () => {
  console.log('\nReceived SIGINT (Ctrl+C). Shutting down gracefully...');

  app.delete(`${TESTING_PATH}/all-data`, (req: Request, res: Response) => {
    res.status(200).send("All good!");
  });

  await closeDB();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('Received SIGTERM. Shutting down gracefully...');

  app.delete(`${TESTING_PATH}/all-data`, (req: Request, res: Response) => {
    res.status(200).send("All good!");
  });

  await closeDB();
  process.exit(0);
});


module.exports = app;
