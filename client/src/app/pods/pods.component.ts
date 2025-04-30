import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { PodsService } from '../services/pods.service';
import { Pod } from '@my-monorepo/api-interfaces';

@Component({
  selector: 'app-pods',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './pods.component.html',
  styleUrl: './pods.component.scss'
})
export class PodsComponent implements OnInit {
  pods: Pod[] = [];
  filteredPods: Pod[] = [];
  loading = true;
  error: string | null = null;
  
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

  constructor(private podsService: PodsService) {}

  ngOnInit(): void {
    this.loadPods();
  }

  loadPods(): void {
    this.loading = true;
    this.error = null;
    
    this.podsService.getPods().subscribe({
      next: (pods) => {
        this.pods = pods;
        this.updateFilterOptions();
        this.applyFilters();
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading pods:', err);
        this.error = 'Failed to load pods. Please try again later.';
        this.loading = false;
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
    this.applyFilters();
  }
}
