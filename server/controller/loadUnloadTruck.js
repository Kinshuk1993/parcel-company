'use strict';

import { TruckDB } from "../model/schema.js";
import { ParcelDB } from "../model/schema.js";
import { logger } from "../config/logConfig.js"
import async from "async";
// import * as validation from "./validation.js";

export const loadTruck = async (req, res) => {
  let truckId = req.params.truckId
  try {
    let truck = await TruckDB.findById(truckId);
    if (!truck) {
      logger.info(`Truck not found with id: ${truckId}, cannot load parcels`);
      return res.status(404).send({ error: `Truck with id ${truckId} not found, cannot load parcels` });
    }
    if (req.body.parcels.length === 0) {
      logger.info(`0 parcels to load to truck with id: ${truckId}`);
      return res.status(200).send();
    }
    _load(truckId, req.body.parcels);
    return res.status(200).send();
  } catch (err) {
    logger.error(`Error loading truck: ${err}`);
    res.status(500).send({ error: err });
  }
}

const _load = (truckId, parcels) => {
  let totalLoaded = 0;
  async.forEachSeries(parcels, function (eachParcelId, callback) {
    ParcelDB.findById(eachParcelId, function (errFindParcel, parcel) {
      if (errFindParcel) {
        logger.error(`Error finding parcel with id ${eachParcelId} with error: ${JSON.stringify(errFindParcel)}`);
        callback();
      }
      if (!parcel) {
        logger.error(`Parcel with id ${eachParcelId} not found, cannot load`);
        callback();
      } else if (parcel.loaded) {
        logger.error(`Parcel with id ${eachParcelId} is already loaded`);
        callback();
      } else {
        ParcelDB.findOneAndUpdate({ _id: eachParcelId }, { truckId: truckId, loaded: true }, function (errUpdateParcel, _updated) {
          if (errUpdateParcel) {
            logger.error(`Parcel with id ${eachParcelId} not updated while loading with error: ${JSON.stringify(errUpdateParcel)}`);
            callback();
          }
          TruckDB.findOneAndUpdate({ _id: truckId }, { $inc: { totalWeight: parcel.weight, totalParcels: 1 } }, function (errUpdateTruck, _updated) {
            if (errUpdateTruck) {
              logger.error(`Truck with id ${truckId} not updated while loading with error: ${JSON.stringify(errUpdateTruck)}`);
              callback();
            }
            totalLoaded++;
            callback();
          });
        });
      }
    });
  }, function () {
    logger.info(`Total ${totalLoaded} parcels loaded in the truck in this attempt`);
  });
}

export const unloadTruck = async (req, res) => {
  let truckId = req.params.truckId
  try {
    let truck = await TruckDB.findById(truckId);
    if (!truck) {
      logger.info(`Truck not found with id: ${truckId}, cannot unload parcels`);
      return res.status(404).send({ error: `Truck with id ${truckId} not found, cannot unload parcels` });
    }
    if (req.body.parcels.length === 0) {
      logger.info(`0 parcels to unload from the truck with id: ${truckId}`);
      return res.status(200).send();
    }
    _unload(truckId, req.body.parcels);
    return res.status(200).send();
  } catch (err) {
    logger.error(`Error loading truck: ${err}`);
    res.status(500).send({ error: err });
  }
}

const _unload = (truckId, parcels) => {
  let totalUnloaded = 0;
  async.forEachSeries(parcels, function (eachParcelId, callback) {
    ParcelDB.findById(eachParcelId, function (errFindParcel, parcel) {
      if (errFindParcel) {
        logger.error(`Error finding parcel during unloading with id ${eachParcelId} with error: ${JSON.stringify(errFindParcel)}`);
        callback();
      } else if (!parcel) {
        logger.error(`Parcel with id ${eachParcelId} not found, cannot unload`);
        callback();
      } else if (!parcel.loaded) {
        logger.error(`Parcel with id ${eachParcelId} is not loaded`);
        callback();
      } else {
        ParcelDB.findOneAndUpdate({ _id: eachParcelId }, { truckId: "", loaded: false }, function (errUpdateParcel, _updated) {
          if (errUpdateParcel) {
            logger.error(`Parcel with id ${eachParcelId} not updated while unloading with error: ${JSON.stringify(errUpdateParcel)}`);
            callback();
          }
          TruckDB.findOneAndUpdate({ _id: truckId }, { $inc: { totalWeight: -parcel.weight, totalParcels: -1 } }, function (errUpdateTruck, _updated) {
            if (errUpdateTruck) {
              logger.error(`Truck with id ${truckId} not updated while unloading with error: ${JSON.stringify(errUpdateTruck)}`);
              callback();
            }
            totalUnloaded++;
            callback();
          });
        });
      }
    });
  }, function () {
    logger.info(`Total ${totalUnloaded} parcels unloaded from the truck in this attempt`);
  });
}
