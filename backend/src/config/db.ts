import mongoose from 'mongoose';

export const connectDB = async () => {
  if (!process.env.MONGODB_URI) {
    console.warn('MONGODB_URI is not defined in environment variables');
    return;
  }

  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB Connected successfully');

    // Drop legacy conflicting index if it exists
    try {
      const db = mongoose.connection.db;
      if (db) {
        const collections = await db.listCollections({ name: 'users' }).toArray();
        if (collections.length > 0) {
          const indexes = await db.collection('users').listIndexes().toArray();
          const hasEmail1 = indexes.some(idx => idx.name === 'email_1');
          if (hasEmail1) {
            await db.collection('users').dropIndex('email_1');
            console.log('Dropped legacy email_1 index');
          }
        }
      }
    } catch (err: any) {
      console.warn('Could not drop legacy index:', err.message);
    }
  } catch (err) {
    console.error('MongoDB Connection Error:', err);
    process.exit(1);
  }
};
