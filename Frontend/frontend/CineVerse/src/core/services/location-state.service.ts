import { Injectable } from '@angular/core';
import { BehaviorSubject, ReplaySubject } from 'rxjs';

export interface SelectedLocation {
  id: number;
  name: string;
}

@Injectable({ providedIn: 'root' })
export class LocationStateService {
  // Use sessionStorage for per-tab isolation
  // store a JSON-serialized object {id, name} in sessionStorage
  private selectedLocation$ = new BehaviorSubject<SelectedLocation | null>(
    (() => {
      const raw = sessionStorage.getItem('selectedLocation');
      try {
        return raw ? (JSON.parse(raw) as SelectedLocation) : null;
      } catch {
        return null;
      }
    })()
  );
  selectedLocation = this.selectedLocation$.asObservable();

  // Use ReplaySubject(1) so an open request emitted before the modal component
  // subscribes (e.g. during app init) will still be received and open the modal.
  private openModal$ = new ReplaySubject<void>(1);
  openModal = this.openModal$.asObservable();

  setLocation(loc: SelectedLocation) {
    sessionStorage.setItem('selectedLocation', JSON.stringify(loc));
    this.selectedLocation$.next(loc);
  }

  getLocation(): SelectedLocation | null {
    return this.selectedLocation$.value;
  }

  hasLocation(): boolean {
    return !!this.selectedLocation$.value && !!this.selectedLocation$.value.name;
  }

  requestOpenModal() {
    this.openModal$.next();
  }
}
