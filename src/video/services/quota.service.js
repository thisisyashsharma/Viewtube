import { newUser } from "../../models/account.model.js";


export async function getUserStorageUsage(userId) {
  const user = await newUser.findById(userId).select("storageUsed");
  return user?.storageUsed || 0;
}

export async function incrementUserStorage(userId, bytes) {
  await newUser.findByIdAndUpdate(userId, {
    $inc: { storageUsed: bytes },
  });
}

export async function decrementUserStorage(userId, bytes) {
  await newUser.findByIdAndUpdate(userId, {
    $inc: { storageUsed: -bytes },
  });
}
