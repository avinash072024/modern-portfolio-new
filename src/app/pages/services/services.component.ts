import { Component, inject, OnInit, OnDestroy, signal } from '@angular/core';
import { Router } from '@angular/router';
import { CtaComponent } from "../../components/cta/cta.component";
import { ServiceService } from '../../services/service/service.service';
import { Service } from '../../interfaces/service';
import { SocketService } from '../../services/socket/socket.service';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-services',
  imports: [CtaComponent],
  templateUrl: './services.component.html',
  styleUrl: './services.component.scss'
})
export class ServicesComponent implements OnInit, OnDestroy {
  services: Service[] = [];
  isLoading = signal(true); // 1. Add loading signal
  router = inject(Router);
  servicesService = inject(ServiceService);
  socketService = inject(SocketService);
  private destroy$ = new Subject<void>();

  ngOnInit(): void {
    this.getServices();
    this.subscribeToSocketUpdates();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private subscribeToSocketUpdates(): void {
    this.socketService
      .onRefreshOrDataUpdated(['services', 'service'])
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.getServices(true, true);
      });
  }

  getServices(forceRefresh: boolean = false, isSilent: boolean = false): void {
    // this.isLoading.set(true); // 2. Set to true before call
    if (!isSilent) {
      this.isLoading.set(true);
    }
    this.servicesService.getServices(forceRefresh).subscribe({
      next: (res: any) => {
        if (res.success) {
          this.services = res?.services || [];
        }
        this.isLoading.set(false); // 3. Set to false on success
      },
      error: (err: any) => {
        // alert(err.message);
        this.isLoading.set(false); // 4. Set to false on error
      },
    })
  }

  goToContact(): void {
    // alert('Clicked');
    this.router.navigateByUrl('/contact');
  }
}
