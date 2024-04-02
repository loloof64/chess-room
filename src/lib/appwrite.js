import { appId, databaseId, collectionId } from '@/credentials/appwrite.js';
import { Client, Databases } from 'appwrite';

const client = new Client();
const databases = new Databases(client);

client
    .setEndpoint('https://cloud.appwrite.io/v1')
    .setProject(appId);

export { client, databases, databaseId, collectionId };