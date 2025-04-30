#!/bin/bash

# Script to create 10 random pods via the API

API_URL="http://localhost:3000/api/pods"

# Arrays for random data generation
PREFIXES=("frontend" "backend" "api" "worker" "job" "cache" "db" "auth" "proxy" "monitoring")
SUFFIXES=("pod" "deployment" "service" "app" "system" "server")
NAMESPACES=("default" "kube-system" "monitoring" "logging" "app" "prod" "dev" "staging" "test")
STATUSES=("Running" "Pending" "Succeeded" "Failed" "Unknown")
CLUSTERS=("prod-cluster" "dev-cluster" "staging-cluster" "test-cluster" "us-central1-cluster" "europe-west1-cluster")
CONTAINER_IMAGES=(
  "nginx:1.19"
  "nginx:latest"
  "redis:6"
  "redis:alpine"
  "mongo:4.4"
  "postgres:13"
  "mysql:8.0"
  "node:14"
  "node:16-alpine"
  "python:3.9"
  "python:3.9-slim"
  "ubuntu:20.04"
  "alpine:3.14"
  "busybox:latest"
  "gcr.io/google-samples/hello-app:1.0"
  "gcr.io/google-samples/hello-app:2.0"
  "k8s.gcr.io/pause:3.5"
)

# Function to get a random element from an array
random_element() {
  local array=("$@")
  echo "${array[$RANDOM % ${#array[@]}]}"
}

# Function to generate a random IP address
random_ip() {
  echo "$((RANDOM % 256)).$((RANDOM % 256)).$((RANDOM % 256)).$((RANDOM % 256))"
}

# Function to generate random pod name
random_pod_name() {
  local prefix=$(random_element "${PREFIXES[@]}")
  local suffix=$(random_element "${SUFFIXES[@]}")
  local random_num=$((RANDOM % 10000))
  echo "${prefix}-${suffix}-${random_num}"
}

# Function to generate random node name based on cluster
random_node_name() {
  local cluster=$1
  local zone="us-east1"
  
  if [[ $cluster == *"us-central"* ]]; then
    zone="us-central1"
  elif [[ $cluster == *"europe"* ]]; then
    zone="europe-west1"
  fi
  
  local node_num=$((RANDOM % 5 + 1))
  echo "gke-${cluster}-node-${zone}-${node_num}"
}

# Function to generate random labels
random_labels() {
  local label_count=$((RANDOM % 3 + 2)) # 2-4 labels
  local labels="{"
  
  local app_values=("frontend" "backend" "api" "worker" "cache" "db")
  local tier_values=("frontend" "backend" "data" "cache")
  local env_values=("prod" "dev" "staging" "test")
  local version_values=("v1" "v2" "v3" "latest" "stable" "beta")
  local managed_by_values=("helm" "kustomize" "manual")
  local component_values=("web" "api" "auth" "worker" "scheduler")
  
  local all_keys=("app" "tier" "environment" "version" "managed-by" "component")
  
  # Shuffle the keys
  local shuffled_keys=($(echo "${all_keys[@]}" | tr ' ' '\n' | sort -R | tr '\n' ' '))
  
  for ((i=0; i<label_count; i++)); do
    local key=${shuffled_keys[$i]}
    local value=""
    
    case $key in
      "app")
        value=$(random_element "${app_values[@]}")
        ;;
      "tier")
        value=$(random_element "${tier_values[@]}")
        ;;
      "environment")
        value=$(random_element "${env_values[@]}")
        ;;
      "version")
        value=$(random_element "${version_values[@]}")
        ;;
      "managed-by")
        value=$(random_element "${managed_by_values[@]}")
        ;;
      "component")
        value=$(random_element "${component_values[@]}")
        ;;
    esac
    
    if [ $i -gt 0 ]; then
      labels+=", "
    fi
    
    labels+="\"$key\": \"$value\""
  done
  
  labels+="}"
  echo "$labels"
}

# Function to generate random annotations
random_annotations() {
  local annotation_count=$((RANDOM % 4)) # 0-3 annotations
  
  if [ $annotation_count -eq 0 ]; then
    echo "{}"
    return
  fi
  
  local annotations="{"
  
  local created_by_values=("user" "system" "operator")
  local scrape_values=("true" "false")
  local port_values=("9090" "8080" "8443")
  local inject_values=("true" "false")
  local revision_values=("1" "2" "3")
  
  local all_keys=(
    "kubernetes.io/created-by"
    "prometheus.io/scrape"
    "prometheus.io/port"
    "sidecar.istio.io/inject"
    "deployment.kubernetes.io/revision"
  )
  
  # Shuffle the keys
  local shuffled_keys=($(echo "${all_keys[@]}" | tr ' ' '\n' | sort -R | tr '\n' ' '))
  
  for ((i=0; i<annotation_count; i++)); do
    local key=${shuffled_keys[$i]}
    local value=""
    
    case $key in
      "kubernetes.io/created-by")
        value=$(random_element "${created_by_values[@]}")
        ;;
      "prometheus.io/scrape")
        value=$(random_element "${scrape_values[@]}")
        ;;
      "prometheus.io/port")
        value=$(random_element "${port_values[@]}")
        ;;
      "sidecar.istio.io/inject")
        value=$(random_element "${inject_values[@]}")
        ;;
      "deployment.kubernetes.io/revision")
        value=$(random_element "${revision_values[@]}")
        ;;
    esac
    
    if [ $i -gt 0 ]; then
      annotations+=", "
    fi
    
    annotations+="\"$key\": \"$value\""
  done
  
  annotations+="}"
  echo "$annotations"
}

# Function to generate random container images
random_container_images() {
  local image_count=$((RANDOM % 3 + 1)) # 1-3 images
  local images="["
  
  for ((i=0; i<image_count; i++)); do
    if [ $i -gt 0 ]; then
      images+=", "
    fi
    
    local image=$(random_element "${CONTAINER_IMAGES[@]}")
    images+="\"$image\""
  done
  
  images+="]"
  echo "$images"
}

# Function to generate random resources
random_resources() {
  local has_requests=$((RANDOM % 5)) # 80% chance (4/5)
  local has_limits=$((RANDOM % 5 < 3)) # 60% chance (3/5)
  
  if [ $has_requests -eq 0 ] && [ $has_limits -eq 0 ]; then
    echo "{}"
    return
  fi
  
  local cpu_requests=("50m" "100m" "200m" "500m" "1")
  local memory_requests=("64Mi" "128Mi" "256Mi" "512Mi" "1Gi")
  local cpu_limits=("100m" "200m" "500m" "1" "2")
  local memory_limits=("128Mi" "256Mi" "512Mi" "1Gi" "2Gi")
  
  local resources="{"
  
  if [ $has_requests -gt 0 ]; then
    resources+="\"requests\": {"
    resources+="\"cpu\": \"$(random_element "${cpu_requests[@]}")\", "
    resources+="\"memory\": \"$(random_element "${memory_requests[@]}")\""
    resources+="}"
  fi
  
  if [ $has_limits -gt 0 ]; then
    if [ $has_requests -gt 0 ]; then
      resources+=", "
    fi
    
    resources+="\"limits\": {"
    resources+="\"cpu\": \"$(random_element "${cpu_limits[@]}")\", "
    resources+="\"memory\": \"$(random_element "${memory_limits[@]}")\""
    resources+="}"
  fi
  
  resources+="}"
  echo "$resources"
}

# Function to create a random pod
create_random_pod() {
  local pod_name=$(random_pod_name)
  local namespace=$(random_element "${NAMESPACES[@]}")
  local status=$(random_element "${STATUSES[@]}")
  local cluster_name=$(random_element "${CLUSTERS[@]}")
  local node_name=$(random_node_name "$cluster_name")
  local labels=$(random_labels)
  local annotations=$(random_annotations)
  local container_images=$(random_container_images)
  local resources=$(random_resources)
  local restart_count=$((RANDOM % 10))
  local pod_ip=$(random_ip)
  local host_ip=$(random_ip)
  
  # Create random date within the last 30 days
  local days_ago=$((RANDOM % 30))
  local creation_timestamp=$(date -v-${days_ago}d +"%Y-%m-%dT%H:%M:%S.000Z")
  
  # Create the JSON payload
  local payload="{
    \"name\": \"$pod_name\",
    \"namespace\": \"$namespace\",
    \"status\": \"$status\",
    \"clusterName\": \"$cluster_name\",
    \"nodeName\": \"$node_name\",
    \"labels\": $labels,
    \"annotations\": $annotations,
    \"creationTimestamp\": \"$creation_timestamp\",
    \"containerImages\": $container_images,
    \"resources\": $resources,
    \"restartCount\": $restart_count,
    \"podIP\": \"$pod_ip\",
    \"hostIP\": \"$host_ip\"
  }"
  
  echo "Creating pod: $pod_name (namespace: $namespace, status: $status)"
  
  # Send the request to the API
  curl -s -X POST "$API_URL" \
    -H "Content-Type: application/json" \
    -d "$payload"
  
  echo -e "\n"
}

echo "Creating 10 random pods via the API..."
for i in {1..10}; do
  create_random_pod
  sleep 1 # Add a small delay between requests
done

echo "Done! Created 10 random pods."
