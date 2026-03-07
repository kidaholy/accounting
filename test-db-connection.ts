import mongoose from 'mongoose';
import dns from 'node:dns';

// Set DNS servers to a reliable public one (Google & Cloudflare)
dns.setServers(['8.8.8.8', '1.1.1.1']);

if (dns.setDefaultResultOrder) {
    dns.setDefaultResultOrder('ipv4first');
}

const MONGO_URI = 'mongodb+srv://kidayos2014:holyunion@cluster0.py8wt9u.mongodb.net/accounting?retryWrites=true&w=majority&appName=Cluster0';

async function testConnection() {
    console.log('Testing connection to MongoDB...');
    console.log('URI:', MONGO_URI.replace(/\/\/.*:.*@/, '//****:****@')); // Mask credentials

    try {
        console.log('Connecting...');
        await mongoose.connect(MONGO_URI, {
            serverSelectionTimeoutMS: 5000, // Timeout after 5 seconds
        });
        console.log('✅ Successfully connected to MongoDB!');

        // @ts-ignore
        const dbName = mongoose.connection.db?.databaseName;
        console.log(`Database name: ${dbName}`);

        // Test basic query
        // @ts-ignore
        const collections = await mongoose.connection.db?.listCollections().toArray();
        console.log(`Available collections: ${collections?.map((c: any) => c.name).join(', ') || 'None'}`);

        // Check for users
        // @ts-ignore
        const userCount = await mongoose.connection.db?.collection('users').countDocuments();
        console.log(`User count in 'users' collection: ${userCount}`);

        if (userCount === 0) {
            console.log('⚠️ No users found. You may need to run the seed API: http://localhost:3000/api/seed (POST request)');
        } else {
            // @ts-ignore
            const users = await mongoose.connection.db?.collection('users').find({}, { projection: { email: 1, role: 1 } }).toArray();
            console.log('Existing users:', JSON.stringify(users, null, 2));
        }

        await mongoose.disconnect();
        console.log('Disconnected from MongoDB.');
    } catch (error) {
        console.error('❌ Failed to connect to MongoDB:');
        console.error(error);
        process.exit(1);
    }
}

testConnection();
