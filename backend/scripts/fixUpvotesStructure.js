import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Issue from '../models/issue.js';

dotenv.config();

async function fixUpvotesStructure() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // Find all issues
    const issues = await Issue.find({});
    console.log(`Found ${issues.length} issues to check`);

    let fixedCount = 0;

    for (const issue of issues) {
      let needsUpdate = false;

      // Check if upvotes structure exists
      if (!issue.upvotes) {
        issue.upvotes = {
          count: 0,
          users: []
        };
        needsUpdate = true;
        console.log(`Fixed missing upvotes structure for issue ${issue._id}`);
      }

      // Check if users array exists
      if (!issue.upvotes.users) {
        issue.upvotes.users = [];
        needsUpdate = true;
        console.log(`Fixed missing users array for issue ${issue._id}`);
      }

      // Ensure count matches users array length
      if (issue.upvotes.count !== issue.upvotes.users.length) {
        issue.upvotes.count = issue.upvotes.users.length;
        needsUpdate = true;
        console.log(`Fixed count mismatch for issue ${issue._id}: was ${issue.upvotes.count}, now ${issue.upvotes.users.length}`);
      }

      // Remove any invalid upvote entries (missing userId or invalid ObjectId)
      const validUsers = issue.upvotes.users.filter(upvote => {
        return upvote &&
               upvote.userId &&
               mongoose.Types.ObjectId.isValid(upvote.userId);
      });

      if (validUsers.length !== issue.upvotes.users.length) {
        const removedCount = issue.upvotes.users.length - validUsers.length;
        issue.upvotes.users = validUsers;
        issue.upvotes.count = validUsers.length;
        needsUpdate = true;
        console.log(`Removed ${removedCount} invalid upvote entries for issue ${issue._id}`);
      }

      if (needsUpdate) {
        await issue.save();
        fixedCount++;
      }
    }

    console.log(`Fixed ${fixedCount} issues`);
    console.log('Migration completed successfully');

  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

// Run the migration
fixUpvotesStructure();
