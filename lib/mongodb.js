import mongoose from 'mongoose';

if (!process.env.MONGODB_URI) {
  throw new Error('Пропущена переменная окружения MONGODB_URI');
}

/**
 * Глобальный объект для соединения с MongoDB
 */
const globalWithMongoose = global.mongoose || (global.mongoose = { conn: null, promise: null });

let cached = globalWithMongoose;

async function connectToDatabase() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const options = {
      bufferCommands: false,
    };

    cached.promise = mongoose.connect(process.env.MONGODB_URI, options)
      .then((mongoose) => {
        return mongoose;
      });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}

export default connectToDatabase;