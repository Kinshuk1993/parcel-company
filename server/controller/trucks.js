"use strict";

import { TruckDB } from "../model/schema.js";
// import { ParcelDB } from "../model/schema.js";
import { logger } from "../config/logConfig.js"
// import async from "async";
// import * as validation from "./validation.js";


export const createTruck = (req, res) => {
  req.body.totalWeight = req.body.truckWeight;
  let newTruck = new TruckDB(req.body);
  return newTruck.save()
    .then((savedTruck) => {
      logger.info(`New truck added: ${JSON.stringify(savedTruck)}`);
      res.status(201).send({ id: savedTruck._id });
    })
    .catch((err) => {
      logger.error('Error in saving new truck to the database: ' + err);
      res.status(500).send({ error: err });
    });
}

export const getTruckById = async (req, res) => {
  let truckId = req.params.truckId
  try {
    let truck = await TruckDB.findById(truckId);
    if (!truck) {
      logger.info(`Truck not found with id: ${truckId}`);
      return res.status(404).send({ error: `Truck with id ${truckId} not found` });
    }
    logger.info(`Truck found: ${JSON.stringify(truck)}`);
    truck = truck.toJSON();
    delete truck.__v;
    return res.status(200).send(truck);
  } catch (err) {
    logger.error(`Error searching for truck: ${err}`);
    res.status(500).send({ error: err });
  }
}

export const getAllTrucks = async (_req, res) => {
  try {
    let allTrucks = await TruckDB.find({});
    logger.info(`${allTrucks.length} trucks retrieved`);
    return res.status(200).send(allTrucks);
  } catch (err) {
    logger.error(`Error retrieving all trucks: ${err}`);
    return res.status(500).send({ error: err });
  }
}

export const removeTruckById = async (req, res) => {
  let truckId = req.params.truckId
  try {
    let deletedTruck = await TruckDB.findByIdAndDelete(truckId);
    if (!deletedTruck) {
      logger.error(`No truck found with id: ${truckId}`);
      return res.status(404).send({ error: `Truck with id ${truckId} not found` });
    }
    logger.info(`Deleted the truck with id: ${truckId}`);
    return res.status(204).send();
  } catch (err) {
    logger.error(`Error deleting truck: ${err}`);
    res.status(500).send({ error: err });
  }
}

export const removeAllTrucks = async (_req, res) => {
  try {
    let deletedTrucks = await TruckDB.deleteMany({});
    logger.info(`Deleted ${deletedTrucks.deletedCount} truck(s) from the database`);
    return res.status(204).send();
  } catch (err) {
    logger.error(`Error deleting all trucks from the database: ${err}`);
    return res.status(500).send({ error: err });
  }
}
