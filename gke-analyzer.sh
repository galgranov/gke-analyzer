#!/bin/bash

# GKE Analyzer - Shell wrapper for gke-pod-analyzer.js
# This script provides a convenient way to run the GKE Pod Analyzer

# Default values
API_URL="http://localhost:3000/pods"
DRY_RUN=false
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
NODE_SCRIPT="${SCRIPT_DIR}/gke-pod-analyzer.js"

# Function to display usage
function show_usage {
  echo "GKE Analyzer - Shell wrapper for gke-pod-analyzer.js"
  echo ""
  echo "Usage: $0 [options]"
  echo ""
  echo "Options:"
  echo "  -p, --project PROJECT_ID    GCP project ID"
  echo "  -c, --cluster CLUSTER_NAME  GKE cluster name (required)"
  echo "  -z, --zone ZONE             GKE cluster zone (for zonal clusters)"
  echo "  -r, --region REGION         GKE cluster region (for regional clusters)"
  echo "  -a, --api-url URL           API endpoint URL (default: http://localhost:3000/pods)"
  echo "  -n, --namespace NAMESPACE   Only process pods in this namespace"
  echo "  -d, --dry-run               Don't send data to API, just print to console"
  echo "  -h, --help                  Show this help message"
  echo ""
  echo "Examples:"
  echo "  $0 --project=my-project --cluster=my-cluster --zone=us-central1-a"
  echo "  $0 --cluster=my-cluster --region=us-central1 --namespace=default"
  echo ""
}

# Parse command line arguments
while [[ $# -gt 0 ]]; do
  case "$1" in
    -p=*|--project=*)
      PROJECT="${1#*=}"
      shift
      ;;
    -p|--project)
      PROJECT="$2"
      shift 2
      ;;
    -c=*|--cluster=*)
      CLUSTER="${1#*=}"
      shift
      ;;
    -c|--cluster)
      CLUSTER="$2"
      shift 2
      ;;
    -z=*|--zone=*)
      ZONE="${1#*=}"
      shift
      ;;
    -z|--zone)
      ZONE="$2"
      shift 2
      ;;
    -r=*|--region=*)
      REGION="${1#*=}"
      shift
      ;;
    -r|--region)
      REGION="$2"
      shift 2
      ;;
    -a=*|--api-url=*)
      API_URL="${1#*=}"
      shift
      ;;
    -a|--api-url)
      API_URL="$2"
      shift 2
      ;;
    -n=*|--namespace=*)
      NAMESPACE="${1#*=}"
      shift
      ;;
    -n|--namespace)
      NAMESPACE="$2"
      shift 2
      ;;
    -d|--dry-run)
      DRY_RUN=true
      shift
      ;;
    -h|--help)
      show_usage
      exit 0
      ;;
    *)
      echo "Unknown option: $1"
      show_usage
      exit 1
      ;;
  esac
done

# Check if required parameters are provided
if [ -z "$CLUSTER" ]; then
  echo "Error: Cluster name is required"
  show_usage
  exit 1
fi

if [ -z "$ZONE" ] && [ -z "$REGION" ]; then
  echo "Error: Either zone or region is required"
  show_usage
  exit 1
fi

# Build the command
CMD="node ${NODE_SCRIPT}"

if [ -n "$PROJECT" ]; then
  CMD="${CMD} --project=${PROJECT}"
fi

CMD="${CMD} --cluster=${CLUSTER}"

if [ -n "$ZONE" ]; then
  CMD="${CMD} --zone=${ZONE}"
elif [ -n "$REGION" ]; then
  CMD="${CMD} --region=${REGION}"
fi

if [ -n "$NAMESPACE" ]; then
  CMD="${CMD} --namespace=${NAMESPACE}"
fi

CMD="${CMD} --api-url=${API_URL}"

if [ "$DRY_RUN" = true ]; then
  CMD="${CMD} --dry-run"
fi

# Execute the command
echo "Executing: ${CMD}"
eval "${CMD}"
