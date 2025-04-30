# GKE Analyzer

A tool for analyzing Google Kubernetes Engine (GKE) pods and resources.

## MongoDB Cloud Connection Setup

This application uses MongoDB for data storage. Follow these steps to connect to a MongoDB cloud cluster:

### 1. Create a MongoDB Atlas Account

If you don't already have one, create an account at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).

### 2. Create a Cluster

- Log in to your MongoDB Atlas account
- Create a new cluster (Free tier is available)
- Choose your preferred cloud provider and region

### 3. Set Up Database Access

- In the MongoDB Atlas dashboard, go to "Database Access"
- Create a new database user with appropriate permissions
- Remember the username and password

### 4. Set Up Network Access

- Go to "Network Access" in the MongoDB Atlas dashboard
- Add your IP address to the IP Access List
- For development, you can allow access from anywhere (0.0.0.0/0)

### 5. Get Your Connection String

- Go to "Clusters" and click "Connect"
- Choose "Connect your application"
- Select "Node.js" as the driver and the appropriate version
- Copy the connection string

### 6. Configure Your .env File

Update your `.env` file with the MongoDB connection string:

```
# MongoDB Connection
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster-url>/<database>?retryWrites=true&w=majority
MONGODB_DB_NAME=gke-analyzer

# Replace:
# - <username> with your MongoDB Atlas username
# - <password> with your MongoDB Atlas password
# - <cluster-url> with your cluster URL
# - <database> with your database name (default: gke-analyzer)
```

## Running the Application

To run the application:

```bash
# Start the API server
npx nx serve api
```

## Environment Variables

The application uses the following environment variables:

### MongoDB Configuration
- `MONGODB_URI`: MongoDB connection string (required)
- `MONGODB_DB_NAME`: MongoDB database name (required)
- `MONGODB_SERVER_SELECTION_TIMEOUT_MS`: Server selection timeout in milliseconds (default: 10000)
- `MONGODB_CONNECT_TIMEOUT_MS`: Connection timeout in milliseconds (default: 15000)
- `MONGODB_SOCKET_TIMEOUT_MS`: Socket timeout in milliseconds (default: 45000)
- `MONGODB_MAX_POOL_SIZE`: Maximum connection pool size (default: 50)
- `MONGODB_MIN_POOL_SIZE`: Minimum connection pool size (default: 5)
- `MONGODB_RETRY_WRITES`: Whether to retry writes (default: true)
- `MONGODB_RETRY_READS`: Whether to retry reads (default: true)

### API Configuration
- `PORT`: Port to run the API server on (default: 3000)
- `NODE_ENV`: Environment mode (development, production, test) (default: development)
