"use strict";

import mongoose from 'mongoose';
const { connect } = mongoose;
import { url } from "../config/env.js"
import { logger } from "../config/logConfig.js"

// keep count of total number of retries done
let count = 0;

const connectWithRetries = () => {
  connect(url).then(() => {
    logger.info("Successfully connected to the database");
    logger.info(`MongoDB URL: ${url}`);
  }).catch(err => {
    logger.info("Error connecting to the database: " + JSON.stringify(err));
    logger.info(`Retrying in 10 seconds, tried ${++count} times`);
    setTimeout(connectWithRetries, 10000)
  })
};

export { mongoose, connectWithRetries };
