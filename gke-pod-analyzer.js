#!/usr/bin/env node

/**
 * GKE Pod Analyzer
 * 
 * This script connects to a GCP GKE cluster, retrieves pod information,
 * and sends it to the API endpoint for storage in the database.
 * 
 * Requirements:
 * - Node.js 14+
 * - Google Cloud SDK (gcloud)
 * - kubectl
 * - GCP project with GKE cluster(s)
 * - API running (default: http://localhost:3000/pods)
 * 
 * Usage:
 * node gke-pod-analyzer.js [options]
 * 
 * Options:
 * --project=PROJECT_ID    GCP project ID (required if not set in gcloud config)
 * --cluster=CLUSTER_NAME  GKE cluster name (required)
 * --zone=ZONE             GKE cluster zone (required for zonal clusters)
 * --region=REGION         GKE cluster region (required for regional clusters)
 * --api-url=URL           API endpoint URL (default: http://localhost:3000/pods)
 * --namespace=NAMESPACE   Only process pods in this namespace (optional)
 * --dry-run               Don't send data to API, just print to console
 * --help                  Show this help message
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');

// Parse command line arguments
const args = process.argv.slice(2);
const options = {
  apiUrl: 'http://localhost:3000/pods',
  dryRun: false
};

// Parse arguments
for (const arg of args) {
  if (arg.startsWith('--project=')) {
    options.project = arg.split('=')[1];
  } else if (arg.startsWith('--cluster=')) {
    options.cluster = arg.split('=')[1];
  } else if (arg.startsWith('--zone=')) {
    options.zone = arg.split('=')[1];
  } else if (arg.startsWith('--region=')) {
    options.region = arg.split('=')[1];
  } else if (arg.startsWith('--api-url=')) {
    options.apiUrl = arg.split('=')[1];
  } else if (arg.startsWith('--namespace=')) {
    options.namespace = arg.split('=')[1];
  } else if (arg === '--dry-run') {
    options.dryRun = true;
  } else if (arg === '--help') {
    showHelp();
    process.exit(0);
  }
}

// Show help function
function showHelp() {
  console.log(`
GKE Pod Analyzer

This script connects to a GCP GKE cluster, retrieves pod information,
and sends it to the API endpoint for storage in the database.

Usage:
node gke-pod-analyzer.js [options]

Options:
--project=PROJECT_ID    GCP project ID (required if not set in gcloud config)
--cluster=CLUSTER_NAME  GKE cluster name (required)
--zone=ZONE             GKE cluster zone (required for zonal clusters)
--region=REGION         GKE cluster region (required for regional clusters)
--api-url=URL           API endpoint URL (default: http://localhost:3000/pods)
--namespace=NAMESPACE   Only process pods in this namespace (optional)
--dry-run               Don't send data to API, just print to console
--help                  Show this help message
  `);
}

// Validate required options
if (!options.cluster) {
  console.error('Error: --cluster is required');
  showHelp();
  process.exit(1);
}

if (!options.zone && !options.region) {
  console.error('Error: either --zone or --region is required');
  showHelp();
  process.exit(1);
}

// Main function
async function main() {
  try {
    console.log('GKE Pod Analyzer');
    console.log('----------------');
    
    // Step 1: Authenticate with GCP and get cluster credentials
    await getClusterCredentials();
    
    // Step 2: Get pod information
    const pods = await getPodInformation();
    
    // Step 3: Process and send pod data to API
    await processPods(pods);
    
    console.log('----------------');
    console.log('Process completed successfully');
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

// Get GKE cluster credentials
async function getClusterCredentials() {
  console.log('Getting GKE cluster credentials...');
  
  let command = 'gcloud container clusters get-credentials';
  command += ` ${options.cluster}`;
  
  if (options.project) {
    command += ` --project=${options.project}`;
  }
  
  if (options.zone) {
    command += ` --zone=${options.zone}`;
  } else if (options.region) {
    command += ` --region=${options.region}`;
  }
  
  try {
    console.log(`Executing: ${command}`);
    execSync(command, { stdio: 'inherit' });
    console.log('Successfully obtained cluster credentials');
  } catch (error) {
    throw new Error(`Failed to get cluster credentials: ${error.message}`);
  }
}

// Get pod information from the cluster
async function getPodInformation() {
  console.log('Retrieving pod information from the cluster...');
  
  let command = 'kubectl get pods';
  
  if (options.namespace) {
    command += ` -n ${options.namespace}`;
  } else {
    command += ' --all-namespaces';
  }
  
  command += ' -o json';
  
  try {
    const output = execSync(command).toString();
    const podList = JSON.parse(output);
    console.log(`Retrieved information for ${podList.items.length} pods`);
    return podList.items;
  } catch (error) {
    throw new Error(`Failed to get pod information: ${error.message}`);
  }
}

// Process pods and send to API
async function processPods(pods) {
  console.log(`Processing ${pods.length} pods...`);
  
  // Get cluster information for additional context
  const clusterInfo = getClusterInfo();
  
  for (const pod of pods) {
    try {
      const podData = transformPodData(pod, clusterInfo);
      
      if (options.dryRun) {
        console.log('Dry run mode - Pod data:');
        console.log(JSON.stringify(podData, null, 2));
      } else {
        await sendPodToApi(podData);
      }
    } catch (error) {
      console.error(`Error processing pod ${pod.metadata.name}: ${error.message}`);
    }
  }
  
  console.log('Finished processing all pods');
}

// Get cluster information
function getClusterInfo() {
  try {
    const output = execSync('kubectl config current-context').toString().trim();
    return {
      clusterName: options.cluster,
      context: output
    };
  } catch (error) {
    console.warn('Warning: Could not get cluster context information');
    return {
      clusterName: options.cluster,
      context: 'unknown'
    };
  }
}

// Transform Kubernetes pod data to API format
function transformPodData(pod, clusterInfo) {
  // Extract container images
  const containerImages = [];
  if (pod.spec && pod.spec.containers) {
    pod.spec.containers.forEach(container => {
      if (container.image) {
        containerImages.push(container.image);
      }
    });
  }
  
  // Extract resource requests and limits
  const resources = { requests: {}, limits: {} };
  let hasResources = false;
  
  if (pod.spec && pod.spec.containers) {
    pod.spec.containers.forEach(container => {
      if (container.resources) {
        hasResources = true;
        
        // Aggregate CPU requests
        if (container.resources.requests && container.resources.requests.cpu) {
          resources.requests.cpu = container.resources.requests.cpu;
        }
        
        // Aggregate memory requests
        if (container.resources.requests && container.resources.requests.memory) {
          resources.requests.memory = container.resources.requests.memory;
        }
        
        // Aggregate CPU limits
        if (container.resources.limits && container.resources.limits.cpu) {
          resources.limits.cpu = container.resources.limits.cpu;
        }
        
        // Aggregate memory limits
        if (container.resources.limits && container.resources.limits.memory) {
          resources.limits.memory = container.resources.limits.memory;
        }
      }
    });
  }
  
  // Calculate restart count
  let restartCount = 0;
  if (pod.status && pod.status.containerStatuses) {
    pod.status.containerStatuses.forEach(status => {
      restartCount += status.restartCount || 0;
    });
  }
  
  // Create the pod data object in the format expected by the API
  return {
    name: pod.metadata.name,
    namespace: pod.metadata.namespace,
    status: pod.status ? pod.status.phase : 'Unknown',
    clusterName: clusterInfo.clusterName,
    nodeName: pod.spec ? pod.spec.nodeName : undefined,
    labels: pod.metadata.labels || {},
    annotations: pod.metadata.annotations || {},
    creationTimestamp: pod.metadata.creationTimestamp,
    containerImages: containerImages,
    resources: hasResources ? resources : undefined,
    restartCount: restartCount,
    podIP: pod.status ? pod.status.podIP : undefined,
    hostIP: pod.status ? pod.status.hostIP : undefined
  };
}

// Send pod data to API
async function sendPodToApi(podData) {
  return new Promise((resolve, reject) => {
    const apiUrl = new URL(options.apiUrl);
    
    const requestOptions = {
      hostname: apiUrl.hostname,
      port: apiUrl.port || (apiUrl.protocol === 'https:' ? 443 : 80),
      path: apiUrl.pathname,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      }
    };
    
    const requestBody = JSON.stringify(podData);
    
    const req = (apiUrl.protocol === 'https:' ? https : http).request(
      requestOptions,
      (res) => {
        let data = '';
        
        res.on('data', (chunk) => {
          data += chunk;
        });
        
        res.on('end', () => {
          if (res.statusCode >= 200 && res.statusCode < 300) {
            console.log(`Successfully sent pod data for ${podData.name} to API`);
            resolve();
          } else {
            reject(new Error(`API request failed with status ${res.statusCode}: ${data}`));
          }
        });
      }
    );
    
    req.on('error', (error) => {
      reject(new Error(`API request error: ${error.message}`));
    });
    
    req.write(requestBody);
    req.end();
  });
}

// Run the main function
main();
