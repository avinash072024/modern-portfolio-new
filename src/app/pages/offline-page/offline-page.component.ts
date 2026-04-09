import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NetworkService } from '../../services/network/network.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-offline-page',
  imports: [CommonModule],
  templateUrl: './offline-page.component.html',
  styleUrl: './offline-page.component.scss'
})
export class OfflinePageComponent implements OnInit, OnDestroy {

  networkService = inject(NetworkService);

  isRetrying = false;
  countdown = 30;
  dnsOk = false;
  gatewayOk = false;
  serverOk = false;

  private countdownTimer: any;
  private retryTimer: any;
  private networkSub: Subscription | null = null;

  tips = [
    { icon: 'bi-wifi',         text: 'Check your Wi-Fi or enable mobile data.' },
    { icon: 'bi-router-fill',  text: 'Try restarting your router or modem.' },
    { icon: 'bi-airplane-fill',text: 'Make sure Airplane mode is turned off.' },
    { icon: 'bi-arrow-repeat', text: 'Move to a location with better signal.' },
  ];

  particles: { left: string; top: string; delay: string; duration: string }[] = [];

  ngOnInit(): void {
    this.generateParticles();
    this.startCountdown();
    this.listenForNetwork();
  }

  ngOnDestroy(): void {
    this.clearTimers();
    this.networkSub?.unsubscribe();
  }

  generateParticles(): void {
    this.particles = Array.from({ length: 20 }, () => ({
      left:     Math.random() * 100 + '%',
      top:      Math.random() * 100 + '%',
      delay:    Math.random() * 5 + 's',
      duration: (4 + Math.random() * 6) + 's',
    }));
  }

  listenForNetwork(): void {
    this.networkSub = this.networkService.onlineStatus$.subscribe(online => {
      if (online && !this.isRetrying) {
        this.onConnectionRestored();
      }
    });
  }

  startCountdown(): void {
    this.countdown = 30;
    this.countdownTimer = setInterval(() => {
      this.countdown--;
      if (this.countdown <= 0) {
        clearInterval(this.countdownTimer);
        this.retry();
      }
    }, 1000);
  }

  retry(): void {
    if (this.isRetrying) return;
    this.clearTimers();
    this.isRetrying = true;
    this.dnsOk = false;
    this.gatewayOk = false;
    this.serverOk = false;

    // Stagger the status chip checks for visual effect
    setTimeout(() => { this.dnsOk = navigator.onLine; }, 600);
    setTimeout(() => { this.gatewayOk = navigator.onLine; }, 1100);
    setTimeout(() => {
      this.serverOk = navigator.onLine;
      this.isRetrying = false;
      if (navigator.onLine) {
        this.onConnectionRestored();
      } else {
        this.startCountdown();
      }
    }, 1700);
  }

  onConnectionRestored(): void {
    this.clearTimers();
    const isKarma = typeof (window as any).__karma__ !== 'undefined';
    if (!isKarma) {
      window.location.reload();
    }
  }

  private clearTimers(): void {
    if (this.countdownTimer) clearInterval(this.countdownTimer);
    if (this.retryTimer) clearTimeout(this.retryTimer);
  }
}
