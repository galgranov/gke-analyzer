import { Component, OnInit, HostListener, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { PodsService } from '../services/pods.service';
import { NotificationService } from '../services/notification.service';
import { Pod } from '@my-monorepo/api-interfaces';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartData, ChartType } from 'chart.js';

@Component({
  selector: 'app-pods',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, BaseChartDirective],
  templateUrl: './pods.component.html',
  styleUrl: './pods.component.scss'
})
export class PodsComponent implements OnInit {
  pods: Pod[] = [];
  filteredPods: Pod[] = [];
  loading = true;
  error: string | null = null;
  selectedPod: Pod | null = null;
  searchTerm = '';
  
  // Sorting
  sortColumn = 'name';
  sortDirection: 'asc' | 'desc' = 'asc';
  
  // Filtering
  filters: Record<string, string> = {
    name: '',
    namespace: '',
    status: '',
    clusterName: '',
    nodeName: '',
    podIP: '',
    hostIP: ''
  };
  
  // Dropdown options for filters
  filterOptions: Record<string, string[]> = {
    name: [],
    namespace: [],
    status: [],
    clusterName: [],
    nodeName: [],
    podIP: [],
    hostIP: []
  };

  // Chart configuration
  public pieChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    plugins: {
      legend: {
        display: true,
        position: 'top',
      },
      title: {
        display: true,
        text: 'Pods by Status'
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            const label = context.label || '';
            const value = context.raw as number;
            let total = 0;
            if (context.dataset.data) {
              // Safely calculate total
              context.dataset.data.forEach(val => {
                if (typeof val === 'number') {
                  total += val;
                }
              });
            }
            const percentage = total > 0 ? Math.round((value / total) * 100) : 0;
            return `${label}: ${value} (${percentage}%)`;
          }
        }
      }
    }
  };
  
  public pieChartData: ChartData<'pie', number[], string | string[]> = {
    labels: [],
    datasets: [{
      data: [],
      backgroundColor: [
        'rgba(75, 192, 192, 0.6)',  // Running - Green
        'rgba(255, 206, 86, 0.6)',  // Pending - Yellow
        'rgba(255, 99, 132, 0.6)',  // Failed - Red
        'rgba(54, 162, 235, 0.6)',  // Succeeded - Blue
        'rgba(153, 102, 255, 0.6)', // Unknown - Purple
        'rgba(201, 203, 207, 0.6)'  // Other - Gray
      ]
    }]
  };
  
  public pieChartType: ChartType = 'pie';

  constructor(
    private podsService: PodsService,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    this.loadPods();
  }
  
  // Process pod data for the chart
  updateChartData(): void {
    // Count pods by status
    const statusCounts: Record<string, number> = {};
    
    this.pods.forEach(pod => {
      const status = pod.status || 'Unknown';
      statusCounts[status] = (statusCounts[status] || 0) + 1;
    });
    
    // Prepare chart data
    const labels: string[] = [];
    const data: number[] = [];
    
    Object.keys(statusCounts).forEach(status => {
      labels.push(status);
      data.push(statusCounts[status]);
    });
    
    this.pieChartData.labels = labels;
    this.pieChartData.datasets[0].data = data;
  }

  loadPods(): void {
    this.loading = true;
    this.error = null;
    
    this.podsService.getPods().subscribe({
      next: (pods) => {
        // Check for status changes if we already have pods
        if (this.pods.length > 0) {
          this.checkForStatusChanges(this.pods, pods);
        }
        
        this.pods = pods;
        this.updateFilterOptions();
        this.applyFilters();
        this.updateChartData();
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading pods:', err);
        this.error = 'Failed to load pods. Please try again later.';
        this.loading = false;
      }
    });
  }
  
  // Check for pod status changes and trigger notifications
  private checkForStatusChanges(oldPods: Pod[], newPods: Pod[]): void {
    // Create a map of old pods by name for quick lookup
    const oldPodsMap = new Map<string, Pod>();
    oldPods.forEach(pod => {
      if (pod.name) {
        oldPodsMap.set(pod.name, pod);
      }
    });
    
    // Check each new pod against old pods
    newPods.forEach(newPod => {
      if (!newPod.name) return;
      
      const oldPod = oldPodsMap.get(newPod.name);
      
      // If pod is new (not in old pods)
      if (!oldPod) {
        this.notificationService.notifyPodStatusChange(newPod.name, newPod.status || 'created');
        return;
      }
      
      // If pod status has changed
      if (oldPod.status !== newPod.status) {
        this.notificationService.notifyPodStatusChange(newPod.name, newPod.status || 'unknown');
      }
    });
    
    // Check for deleted pods
    oldPods.forEach(oldPod => {
      if (!oldPod.name) return;
      
      // If pod exists in old pods but not in new pods, it was deleted
      if (!newPods.some(p => p.name === oldPod.name)) {
        this.notificationService.addNotification(`Pod ${oldPod.name} was deleted`, 'info');
      }
    });
  }
  
  // Update filter dropdown options based on available pod data
  updateFilterOptions(): void {
    // Reset filter options
    Object.keys(this.filterOptions).forEach(key => {
      this.filterOptions[key as keyof typeof this.filterOptions] = [];
    });
    
    // Extract unique values for each column
    this.pods.forEach(pod => {
      Object.keys(this.filters).forEach(key => {
        const value = pod[key as keyof Pod];
        if (value && !this.filterOptions[key as keyof typeof this.filterOptions].includes(String(value))) {
          this.filterOptions[key as keyof typeof this.filterOptions].push(String(value));
        }
      });
    });
    
    // Sort options alphabetically
    Object.keys(this.filterOptions).forEach(key => {
      this.filterOptions[key as keyof typeof this.filterOptions].sort();
    });
  }

  // Sorting functions
  sort(column: string): void {
    if (this.sortColumn === column) {
      // Toggle sort direction if clicking the same column
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      // Default to ascending for a new column
      this.sortColumn = column;
      this.sortDirection = 'asc';
    }
    
    this.applyFilters();
  }
  
  getSortIcon(column: string): string {
    if (this.sortColumn !== column) {
      return 'fa-sort';
    }
    return this.sortDirection === 'asc' ? 'fa-sort-up' : 'fa-sort-down';
  }
  
  // Filtering functions
  applyFilters(): void {
    let result = [...this.pods];
    
    // Apply search term if present
    if (this.searchTerm.trim()) {
      const searchLower = this.searchTerm.toLowerCase().trim();
      result = result.filter(pod => {
        // Search in name, namespace, status, cluster, node
        return (
          (pod.name && pod.name.toLowerCase().includes(searchLower)) ||
          (pod.namespace && pod.namespace.toLowerCase().includes(searchLower)) ||
          (pod.status && pod.status.toLowerCase().includes(searchLower)) ||
          (pod.clusterName && pod.clusterName.toLowerCase().includes(searchLower)) ||
          (pod.nodeName && pod.nodeName.toLowerCase().includes(searchLower)) ||
          (pod.podIP && pod.podIP.toLowerCase().includes(searchLower)) ||
          (pod.hostIP && pod.hostIP.toLowerCase().includes(searchLower))
        );
      });
    }
    
  // Apply filters for each column
  Object.keys(this.filters).forEach(key => {
    const filterValue = this.filters[key as keyof typeof this.filters];
    if (filterValue) {
      result = result.filter(pod => {
        const value = pod[key as keyof Pod];
        return value && String(value) === filterValue;
      });
    }
  });
  
  // Update chart data if filters are applied
  if (result.length !== this.pods.length) {
    // Count filtered pods by status
    const statusCounts: Record<string, number> = {};
    
    result.forEach(pod => {
      const status = pod.status || 'Unknown';
      statusCounts[status] = (statusCounts[status] || 0) + 1;
    });
    
    // Prepare chart data
    const labels: string[] = [];
    const data: number[] = [];
    
    Object.keys(statusCounts).forEach(status => {
      labels.push(status);
      data.push(statusCounts[status]);
    });
    
    this.pieChartData.labels = labels;
    this.pieChartData.datasets[0].data = data;
  } else {
    this.updateChartData();
  }
  
  // Apply sorting
    result.sort((a, b) => {
      const aValue = a[this.sortColumn as keyof Pod];
      const bValue = b[this.sortColumn as keyof Pod];
      
      // Handle undefined values
      if (aValue === undefined && bValue === undefined) return 0;
      if (aValue === undefined) return this.sortDirection === 'asc' ? 1 : -1;
      if (bValue === undefined) return this.sortDirection === 'asc' ? -1 : 1;
      
      // Compare values
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return this.sortDirection === 'asc' 
          ? aValue.localeCompare(bValue) 
          : bValue.localeCompare(aValue);
      } else {
        // For non-string values, convert to string for comparison
        const aStr = String(aValue);
        const bStr = String(bValue);
        return this.sortDirection === 'asc' 
          ? aStr.localeCompare(bStr) 
          : bStr.localeCompare(aStr);
      }
    });
    
    this.filteredPods = result;
  }
  
  // Clear all filters
  clearFilters(): void {
    Object.keys(this.filters).forEach(key => {
      this.filters[key as keyof typeof this.filters] = '';
    });
    this.searchTerm = '';
    this.applyFilters();
  }
  
  // Search functionality
  searchPods(): void {
    this.applyFilters();
  }
  
  // Clear search
  clearSearch(): void {
    this.searchTerm = '';
    this.applyFilters();
  }
  
  // Select pod to show details
  selectPod(pod: Pod): void {
    this.selectedPod = pod;
  }
  
  // Close the pod details popup
  closeDetails(): void {
    this.selectedPod = null;
  }
  
  // Close popup when clicking outside
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    // Check if the click is outside the popup and not on a table row
    if (this.selectedPod && 
        !target.closest('.pod-details-popup') && 
        !target.closest('.pod-row')) {
      this.closeDetails();
    }
  }
}
