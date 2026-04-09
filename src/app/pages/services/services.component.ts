import { Component, inject, OnInit } from '@angular/core';
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
  router = inject(Router);
  servicesService = inject(ServiceService);

  ngOnInit(): void {
    this.getServices();
  }

  getServices(): void {
    this.servicesService.getServices().subscribe({
      next: (res: any) => {
        if (res.success) {
          this.services = res?.services || [];
        } else {
          // alert(res?.message);
        }
      },
      error: (err: any) => {
        // alert(err.message);
      },
    })
  }

  goToContact(): void {
    // alert('Clicked');
    this.router.navigateByUrl('/contact');
  }
}
