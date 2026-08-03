const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const User = require('./models/User');

const setAdmin = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI || 'mongodb://localhost:27017/campuslink';
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB...');

    const email = process.argv[2];
    if (!email) {
      const users = await User.find({});
      if (users.length === 0) {
        console.log('No users found in database.');
      } else {
        console.log('Existing users:');
        users.forEach(u => console.log(`- ${u.name} (${u.email}) [role: ${u.role || 'student'}]`));
        console.log('\nTo make a user an admin, run:\nnode set-admin.js <email>');
      }
      process.exit(0);
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      console.log(`User with email "${email}" not found.`);
      process.exit(1);
    }

    user.role = 'admin';
    await user.save();
    console.log(`\n✅ Success: ${user.name} (${user.email}) has been updated to role "admin"!`);
    process.exit(0);
  } catch (error) {
    console.error('Error setting admin:', error);
    process.exit(1);
  }
};

setAdmin();
