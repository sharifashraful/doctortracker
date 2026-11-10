import mongoose from "mongoose";
import { Doctor } from "../models/Doctor.js";
import { Patient } from "../models/Patient.js";
import { User } from "../models/User.js";
import { startPortableMongo, stopPortableMongo, usesPortableMongo } from "./portable-mongo.js";

let indexes: Promise<void> | null = null;

export async function connectDB() {
  const uri = usesPortableMongo() ? await startPortableMongo() : process.env.MONGODB_URI!.trim();
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(uri);
  }
  if (!indexes) {
    indexes = Promise.all([User.syncIndexes(), Doctor.syncIndexes(), Patient.syncIndexes()])
      .then(() => undefined)
      .catch((error) => {
        indexes = null;
        throw error;
      });
  }
  await indexes;
}

export async function disconnectDB() {
  if (mongoose.connection.readyState !== 0) await mongoose.disconnect();
  await stopPortableMongo();
}
