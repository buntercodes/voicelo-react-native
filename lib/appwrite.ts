import { APPWRITE_CONFIG } from '@/constants/appwrite';
import { Account, Client, Databases } from 'react-native-appwrite';

const client = new Client()
    .setEndpoint(APPWRITE_CONFIG.ENDPOINT)
    .setProject(APPWRITE_CONFIG.PROJECT_ID)
    .setPlatform(APPWRITE_CONFIG.PLATFORM);

export const account = new Account(client);
export const databases = new Databases(client);
export { client };
