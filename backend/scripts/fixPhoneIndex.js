import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const fixPhoneIndex = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    const db = mongoose.connection.db;
    const usersCollection = db.collection('users');

    // Get current indexes
    const indexes = await usersCollection.indexes();
    console.log('Current indexes:', indexes);

    // Check if phone_1 index exists
    const phoneIndexExists = indexes.some(index => index.name === 'phone_1');
    
    if (phoneIndexExists) {
      console.log('Dropping existing phone_1 index...');
      await usersCollection.dropIndex('phone_1');
      console.log('Phone index dropped successfully');
    }

    // Create new sparse unique index for phone
    console.log('Creating new sparse unique index for phone...');
    await usersCollection.createIndex(
      { phone: 1 }, 
      { 
        unique: true, 
        sparse: true,
        name: 'phone_1_sparse'
      }
    );
    console.log('New sparse phone index created successfully');

    // Remove any duplicate null phone entries
    console.log('Checking for users with null phone values...');
    const usersWithNullPhone = await usersCollection.find({ phone: null }).toArray();
    console.log(`Found ${usersWithNullPhone.length} users with null phone`);

    if (usersWithNullPhone.length > 1) {
      console.log('Removing duplicate null phone entries...');
      // Keep the first one, remove the rest
      const idsToRemove = usersWithNullPhone.slice(1).map(user => user._id);
      
      if (idsToRemove.length > 0) {
        const result = await usersCollection.deleteMany({
          _id: { $in: idsToRemove }
        });
        console.log(`Removed ${result.deletedCount} duplicate users with null phone`);
      }
    }

    // Update users with null phone to undefined (to work better with sparse index)
    console.log('Updating null phone values to undefined...');
    const updateResult = await usersCollection.updateMany(
      { phone: null },
      { $unset: { phone: "" } }
    );
    console.log(`Updated ${updateResult.modifiedCount} users`);

    console.log('Phone index fix completed successfully!');
    
  } catch (error) {
    console.error('Error fixing phone index:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
};

// Run the fix
fixPhoneIndex();
