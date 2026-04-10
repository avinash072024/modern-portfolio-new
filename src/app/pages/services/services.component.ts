import { Component, inject, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';
import { CtaComponent } from "../../components/cta/cta.component";
import { ServiceService } from '../../services/service/service.service';
import { Service } from '../../interfaces/service';

@Component({
  selector: 'app-services',
  imports: [CtaComponent],
  templateUrl: './services.component.html',
  styleUrl: './services.component.scss'
})
export class ServicesComponent implements OnInit {
  services: Service[] = [];
  isLoading = signal(true); // 1. Add loading signal
  router = inject(Router);
  servicesService = inject(ServiceService);

  ngOnInit(): void {
    this.getServices();
  }

  getServices(): void {
    this.isLoading.set(true); // 2. Set to true before call
    this.servicesService.getServices().subscribe({
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
