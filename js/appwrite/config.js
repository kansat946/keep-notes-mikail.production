// Appwrite Configuration & Client Setup
const AppwriteConfig = {
  endpoint: import.meta.env.VITE_APPWRITE_ENDPOINT || 'https://cloud.appwrite.io/v1',
  projectId: import.meta.env.VITE_APPWRITE_PROJECT_ID || '6a8827b1000b3dfbd098',
  apiKey: import.meta.env.VITE_APPWRITE_API_KEY,
  databaseId: import.meta.env.VITE_APPWRITE_DATABASE_ID || '6a882a87000c35fe83bf',
  collectionId: import.meta.env.VITE_APPWRITE_COLLECTION_ID || '6a882a87000c35fe83bf'
};

// Initialize Appwrite Client
const client = new Appwrite.Client()
  .setEndpoint(AppwriteConfig.endpoint)
  .setProject(AppwriteConfig.projectId);

if (AppwriteConfig.apiKey) {
  client.setKey(AppwriteConfig.apiKey);
}

// Services
const account = new Appwrite.Account(client);
const databases = new Appwrite.Databases(client);
const storage = new Appwrite.Storage(client);

// Export
window.AppwriteConfig = AppwriteConfig;
window.AppwriteClient = client;
window.AppwriteAccount = account;
window.AppwriteDatabases = databases;
window.AppwriteStorage = storage;

console.log('✅ Appwrite configured:', AppwriteConfig.endpoint);
