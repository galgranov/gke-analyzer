# GKE Pod Analyzer

This script connects to a Google Kubernetes Engine (GKE) cluster, retrieves pod information, and sends it to the API endpoint for storage in the database.

## Requirements

- Node.js 14+
- Google Cloud SDK (`gcloud`)
- Kubernetes CLI (`kubectl`)
- GCP project with GKE cluster(s)
- API running (default: http://localhost:3000/pods)

## Installation

1. Ensure you have Node.js installed
2. Ensure you have the Google Cloud SDK installed and configured
3. Ensure you have kubectl installed
4. Make the script executable: `chmod +x gke-pod-analyzer.js`

## Usage

```bash
./gke-pod-analyzer.js [options]
```

Or:

```bash
node gke-pod-analyzer.js [options]
```

### Options

- `--project=PROJECT_ID` - GCP project ID (required if not set in gcloud config)
- `--cluster=CLUSTER_NAME` - GKE cluster name (required)
- `--zone=ZONE` - GKE cluster zone (required for zonal clusters)
- `--region=REGION` - GKE cluster region (required for regional clusters)
- `--api-url=URL` - API endpoint URL (default: http://localhost:3000/pods)
- `--namespace=NAMESPACE` - Only process pods in this namespace (optional)
- `--dry-run` - Don't send data to API, just print to console
- `--help` - Show help message

## Examples

### Process all pods in a zonal cluster

```bash
./gke-pod-analyzer.js --project=my-gcp-project --cluster=my-cluster --zone=us-central1-a
```

### Process all pods in a regional cluster

```bash
./gke-pod-analyzer.js --project=my-gcp-project --cluster=my-cluster --region=us-central1
```

### Process pods in a specific namespace

```bash
./gke-pod-analyzer.js --project=my-gcp-project --cluster=my-cluster --zone=us-central1-a --namespace=default
```

### Dry run (don't send to API)

```bash
./gke-pod-analyzer.js --project=my-gcp-project --cluster=my-cluster --zone=us-central1-a --dry-run
```

### Use a custom API endpoint

```bash
./gke-pod-analyzer.js --project=my-gcp-project --cluster=my-cluster --zone=us-central1-a --api-url=https://my-api.example.com/pods
```

## How It Works

1. The script authenticates with GCP and gets the credentials for the specified GKE cluster
2. It retrieves pod information using kubectl
3. It transforms the Kubernetes pod data into the format expected by the API
4. It sends the data to the API endpoint for storage in the database

## Data Collected

The script collects the following information for each pod:

- Name
- Namespace
- Status
- Cluster name
- Node name
- Labels
- Annotations
- Creation timestamp
- Container images
- Resource requests and limits
- Restart count
- Pod IP
- Host IP

## Troubleshooting

### Authentication Issues

If you encounter authentication issues, ensure you're logged in to gcloud:

```bash
gcloud auth login
```

### Cluster Access Issues

Ensure you have access to the GKE cluster:

```bash
gcloud container clusters list
```

### API Connection Issues

Ensure the API is running and accessible:

```bash
curl http://localhost:3000/pods
```

## Automating with Cron

You can set up a cron job to run this script periodically:

```bash
# Run every hour
0 * * * * /path/to/gke-pod-analyzer.js --project=my-gcp-project --cluster=my-cluster --zone=us-central1-a >> /path/to/logs/gke-pod-analyzer.log 2>&1
