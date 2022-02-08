"use strict";

import { mongoose } from "./service.js";
const Schema = mongoose.Schema;
const model = mongoose.model;

const truckDB = new Schema({
  truckWeight: {
    type: Number,
    required: true,
    min: 1
  },
  totalWeight: {
    type: Number,
    default: 0,
    min: 0
  },
  totalParcels: {
    type: Number,
    default: 0
  },
});

export const TruckDB = model("TruckDB", truckDB);

const parcelDB = new Schema({
  weight: {
    type: Number,
    required: true,
    min: 0
  },
  truckId: {
    type: String,
    default: ""
  },
  loaded: {
    type: Boolean,
    default: false
  },
  name: {
    type: String,
    required: true
  }
});

export const ParcelDB = model("ParcelDB", parcelDB);
