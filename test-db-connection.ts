import mongoose from 'mongoose';
import * as dotenv from 'dotenv';
import path from 'path';

// Load .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

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

        await mongoose.disconnect();
        console.log('Disconnected from MongoDB.');
    } catch (error) {
        console.error('❌ Failed to connect to MongoDB:');
        console.error(error);
        process.exit(1);
    }
}

testConnection();
