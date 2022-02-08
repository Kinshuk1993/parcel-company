'use strict';

export const defaultReply = (req, res) => {
  logger.info(`${req.method} method is not implemented for path ${req.url}`);
  res.status(501).send({ error: `${req.method} method is not implemented for path ${req.url}` });
}
