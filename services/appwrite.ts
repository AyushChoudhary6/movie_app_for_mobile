import { Client, Databases } from 'react-native-appwrite';

const client = new Client();

client
  .setEndpoint(process.env.EXPO_PUBLIC_APPWRITE_ENDPOINT || '')
  .setProject(process.env.EXPO_PUBLIC_APPWRITE_PROJECT_ID || '')
  .setPlatform('com.movieapp');

export const databases = new Databases(client);
export default client;

