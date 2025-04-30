import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { PodsService } from '../services/pods.service';
import { Pod } from '@my-monorepo/api-interfaces';

@Component({
  selector: 'app-pods',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './pods.component.html',
  styleUrl: './pods.component.scss'
})
export class PodsComponent implements OnInit {
  pods: Pod[] = [];
  loading = true;
  error: string | null = null;

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
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading pods:', err);
        this.error = 'Failed to load pods. Please try again later.';
        this.loading = false;
      }
    });
  }
}
