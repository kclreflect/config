import build from './app';
import logger from './winston';

(async () => {
  const server = await build();
  try {
    await server.listen(3000);
  } catch (error) {
    logger.error(error);
    process.exit(1);
  }
})();
