import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';

import { FooterComponent } from './footer.component';

describe('FooterComponent', () => {
  let component: FooterComponent;
  let fixture: ComponentFixture<FooterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FooterComponent, RouterTestingModule, HttpClientTestingModule]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FooterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render app name and year', () => {
    fixture.detectChanges();
    const el: HTMLElement = fixture.nativeElement;
    const brand = el.querySelector('.footer-brand')?.textContent || '';
    expect(brand).toContain(component.appName1);
    expect(brand).toContain(component.appName2);

    const bottom = el.querySelector('.footer-bottom')?.textContent || '';
    expect(bottom).toContain(component.currentYear.toString());
  });
});
