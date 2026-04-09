import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { importProvidersFrom } from '@angular/core';

import { OfflinePageComponent } from './offline-page.component';

describe('OfflinePageComponent', () => {
  let component: OfflinePageComponent;
  let fixture: ComponentFixture<OfflinePageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OfflinePageComponent, HttpClientTestingModule],
      providers: [importProvidersFrom(HttpClientTestingModule)]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OfflinePageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
