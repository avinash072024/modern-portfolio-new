import { Injectable, NgZone } from '@angular/core';
import { BehaviorSubject, fromEvent, mapTo, merge, of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class NetworkService {
  private onlineStatus = new BehaviorSubject<boolean>(navigator.onLine);
  public onlineStatus$ = this.onlineStatus.asObservable();

  constructor(private zone: NgZone) {
    this.monitorNetworkStatus();
  }

  private monitorNetworkStatus() {
    const online$ = fromEvent(window, 'online').pipe(mapTo(true));
    const offline$ = fromEvent(window, 'offline').pipe(mapTo(false));
    const connection$ = merge(online$, offline$, of(navigator.onLine));

    connection$.subscribe(status => {
      this.zone.run(() => {
        this.onlineStatus.next(status);
        // console.log('Network status changed: ', status ? 'Online' : 'Offline');
      });
    });
  }

  isOnline(): boolean {
    return this.onlineStatus.value;
  }
}
