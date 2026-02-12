import { createServerApp } from './src/app.js';
import { getApplicationConfig } from './src/config/appConfig.js';
import { createLogger } from './src/utils/logger.js';

const logger = createLogger('server');
const appConfig = getApplicationConfig();
const app = await createServerApp(appConfig);

app.listen(appConfig.port, () => {
  logger.info(`API server listening on port ${appConfig.port}`);
});
