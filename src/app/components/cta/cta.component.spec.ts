import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';

import { CtaComponent } from './cta.component';

describe('CtaComponent', () => {
  let component: CtaComponent;
  let fixture: ComponentFixture<CtaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CtaComponent, RouterTestingModule, HttpClientTestingModule]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CtaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render inputs into template', () => {
    component.title = 'Hire me';
    component.subtitle = 'Available for work';
    component.buttonText = "Let's Chat";
    component.buttonLink = '/contact';
    fixture.detectChanges();

    const el: HTMLElement = fixture.nativeElement;
    expect(el.querySelector('.cta-content h2')?.textContent).toContain('Hire me');
    expect(el.querySelector('.cta-content p')?.textContent).toContain('Available for work');
    expect(el.querySelector('.cta-action a')?.textContent).toContain("Let's Chat");
  });
});
