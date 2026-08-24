import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';

import { HeaderComponent } from './header.component';

describe('HeaderComponent', () => {
  let component: HeaderComponent;
  let fixture: ComponentFixture<HeaderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HeaderComponent, RouterTestingModule, HttpClientTestingModule]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should expose navLinks and app names', () => {
    expect(component.navLinks.length).toBeGreaterThan(0);
    expect(component.appName1).toBeTruthy();
    expect(component.appName2).toBeTruthy();
  });

  it('should toggle isScrolled based on window.scrollY', () => {
    const orig = (window as any).scrollY;
    Object.defineProperty(window, 'scrollY', { value: 200, configurable: true });
    component.onWindowScroll();
    expect(component.isScrolled()).toBeTrue();

    Object.defineProperty(window, 'scrollY', { value: 0, configurable: true });
    component.onWindowScroll();
    expect(component.isScrolled()).toBeFalse();

    Object.defineProperty(window, 'scrollY', { value: orig, configurable: true });
  });
});
