"use strict";

import { ParcelDB } from "../model/schema.js";
import { TruckDB } from "../model/schema.js";
import { logger } from "../config/logConfig.js"
// import * as validation from "./validation.js";

export const createParcel = (req, res) => {
  let newParcel = new ParcelDB(req.body);
  return newParcel.save()
    .then((savedParcel) => {
      logger.info(`New parcel added: ${JSON.stringify(savedParcel)}`);
      res.status(201).send({ id: savedParcel._id });
    })
    .catch((err) => {
      logger.error('Error in saving new parcel to the database: ' + err);
      res.status(500).send({ error: err });
    });
}

export const getParcelById = async (req, res) => {
  let parcelId = req.params.parcelId
  try {
    let parcel = await ParcelDB.findById(parcelId);
    if (!parcel) {
      logger.info(`Parcel not found with id: ${parcelId}`);
      return res.status(404).send({ error: `Parcel with id ${parcelId} not found` });
    }
    logger.info(`Parcel found: ${JSON.stringify(parcel)}`);
    parcel = parcel.toJSON();
    delete parcel.__v;
    return res.status(200).send(parcel);
  } catch (err) {
    logger.error(`Error searching for parcel: ${err}`);
    res.status(500).send({ error: err });
  }
}

export const getAllParcels = async (_req, res) => {
  try {
    let allParcels = await ParcelDB.find({});
    logger.info(`${allParcels.length} parcels retrieved`);
    return res.status(200).send(allParcels);
  } catch (err) {
    logger.error(`Error retrieving all parcels: ${err}`);
    return res.status(500).send({ error: err });
  }
}

export const removeParcelById = async (req, res) => {
  let parcelId = req.params.parcelId
  try {
    let parcel = await ParcelDB.findById(parcelId);
    if (!parcel) {
      logger.error(`Parcel not found with id: ${parcelId}`);
      return res.status(404).send({ error: `Parcel with id ${parcelId} not found` });
    }
    if (parcel.truckId) {
      let truck = await TruckDB.findById(parcel.truckId);
      if (truck) {
        logger.info(`Truck found for parcel id: ${parcelId}, unloading parcel from truck before deleting parcel..`);
        await TruckDB.findOneAndUpdate({ _id: parcel.truckId }, { $inc: { totalWeight: -parcel.weight, totalParcels: -1 } });
      }
    }
    await ParcelDB.deleteOne({ _id: parcelId });
    logger.info(`Deleted the parcel with id: ${parcelId}`);
    return res.status(204).send();
  } catch (err) {
    logger.error(`Error deleting parcel: ${err}`);
    res.status(500).send({ error: err });
  }
}

// only during dev for testing
export const removeAllParcels = async (_req, res) => {
  try {
    let deletedParcels = await ParcelDB.deleteMany({});
    logger.info(`Deleted ${deletedParcels.deletedCount} parcel(s) from the database`);
    return res.status(204).send();
  } catch (err) {
    logger.error(`Error deleting all parcels from the database: ${err}`);
    return res.status(500).send({ error: err });
  }
}
