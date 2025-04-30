#!/bin/bash

# Test script for GKE Pod Analyzer
# This script demonstrates how to use the GKE Pod Analyzer in dry-run mode

# Set your GCP project, cluster, and zone/region
# Replace these values with your actual GCP project, cluster, and zone/region
PROJECT="your-gcp-project-id"
CLUSTER="your-gke-cluster-name"
ZONE="your-cluster-zone" # e.g., us-central1-a
# REGION="your-cluster-region" # Uncomment and use this instead of ZONE for regional clusters

# Check if the required tools are installed
echo "Checking prerequisites..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "Error: Node.js is not installed. Please install Node.js before running this script."
    exit 1
fi

# Check if gcloud is installed
if ! command -v gcloud &> /dev/null; then
    echo "Error: Google Cloud SDK (gcloud) is not installed. Please install it before running this script."
    exit 1
fi

# Check if kubectl is installed
if ! command -v kubectl &> /dev/null; then
    echo "Error: kubectl is not installed. Please install it before running this script."
    exit 1
fi

echo "All prerequisites are installed."

# Get the directory of this script
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "This is a test script for the GKE Pod Analyzer."
echo "It will run the analyzer in dry-run mode, which means it won't send any data to the API."
echo "Instead, it will print the pod data to the console."
echo ""
echo "Current configuration:"
echo "  Project: $PROJECT"
echo "  Cluster: $CLUSTER"
echo "  Zone: $ZONE"
# echo "  Region: $REGION" # Uncomment for regional clusters
echo ""
echo "Before running this test, make sure you have:"
echo "  1. Updated this script with your actual GCP project, cluster, and zone/region"
echo "  2. Authenticated with GCP: gcloud auth login"
echo "  3. Set your GCP project: gcloud config set project $PROJECT"
echo ""
read -p "Do you want to continue? (y/n): " -n 1 -r
echo ""

if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Test cancelled."
    exit 0
fi

echo "Running GKE Pod Analyzer in dry-run mode..."
echo ""

# Run the GKE Pod Analyzer in dry-run mode
"$SCRIPT_DIR/gke-analyzer.sh" \
    --project="$PROJECT" \
    --cluster="$CLUSTER" \
    --zone="$ZONE" \
    --dry-run

# Uncomment for regional clusters
# "$SCRIPT_DIR/gke-analyzer.sh" \
#     --project="$PROJECT" \
#     --cluster="$CLUSTER" \
#     --region="$REGION" \
#     --dry-run

echo ""
echo "Test completed."
echo "If you want to run the analyzer and actually send data to the API,"
echo "remove the --dry-run flag from the command above."
