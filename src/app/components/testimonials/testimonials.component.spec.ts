import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';

import { TestimonialsComponent } from './testimonials.component';

describe('TestimonialsComponent', () => {
  let component: TestimonialsComponent;
  let fixture: ComponentFixture<TestimonialsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestimonialsComponent, HttpClientTestingModule]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TestimonialsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load testimonials from data and render first item', () => {
    fixture.detectChanges();
    expect(component.testimonials.length).toBeGreaterThan(0);
    const el: HTMLElement = fixture.nativeElement;
    const firstName = el.querySelector('.testimonial-slide h6')?.textContent || '';
    expect(firstName).toContain(component.testimonials[0].name);
  });
});
