"use strict";

import * as defaultReply from "../controller/default.js";
import * as parcels from "../controller/parcels.js";
import * as trucks from "../controller/trucks.js";
import * as loadUnloadTruck from "../controller/loadUnloadTruck.js";

// define all routes
export const allRoutes = (app) => {
  // Parcel
  app.post("/parcel", [
    parcels.createParcel
  ]);
  app.get("/parcel/:parcelId", [
    parcels.getParcelById
  ]);
  app.get("/getAllParcels", [
    parcels.getAllParcels
  ]);
  app.delete("/parcel/:parcelId", [
    parcels.removeParcelById
  ]);
  app.delete("/deleteAllParcels", [
    parcels.removeAllParcels
  ]);

  // Truck
  app.post("/truck", [
    trucks.createTruck
  ]);
  app.get("/truck/:truckId", [
    trucks.getTruckById
  ]);
  app.get("/getAllTrucks", [
    trucks.getAllTrucks
  ]);
  app.delete("/truck/:truckId", [
    trucks.removeTruckById
  ]);
  app.delete("/deleteAllTrucks", [
    trucks.removeAllTrucks
  ]);

  // Load
  app.post("/loadTruck/:truckId", [
    loadUnloadTruck.loadTruck
  ]);

  // Unload
  app.post("/unloadTruck/:truckId", [
    loadUnloadTruck.unloadTruck
  ]);

  // Default
  app.get("/*", [
    defaultReply.defaultReply
  ]);
};

