import {
  Component,
  computed,
  effect,
  ElementRef,
  inject,
  NgZone,
  OnDestroy,
  OnInit,
  signal,
  untracked,
  viewChild
} from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { Testimonial } from '../../interfaces/testimonial';
import { FeedbackService } from '../../services/feedback/feedback.service';
import { ValidationService } from '../../services/validations/validation.service';
import { ToastService } from '../../services/toast/toast.service';
import { ToastComponent } from '../toast/toast.component';
import { SocketService } from '../../services/socket/socket.service';

interface BootstrapModalInstance {
  hide(): void;
}

interface BootstrapModalApi {
  getOrCreateInstance(element: Element): BootstrapModalInstance;
}

interface BootstrapWindow extends Window {
  bootstrap?: {
    Modal?: BootstrapModalApi;
  };
}

interface MarqueeItem {
  key: string;
  isClone: boolean;
  testimonial: Testimonial;
  rating: number;
  stars: boolean[];
  initials: string;
}

/** Auto-scroll speed in px / second. */
const AUTO_SPEED = 42;
/** How long auto-scroll waits after the user scrolls, drags or clicks an arrow. */
const RESUME_DELAY = 2500;
/** Minimum cards in one "set" so a set is always wider than the screen. */
const MIN_CARDS_PER_SET = 8;
/** Three sets let the user scroll backwards infinitely too. */
const SET_COUNT = 3;
/** Need at least this many testimonials before the loop kicks in. */
const MIN_FOR_LOOP = 3;

const prefersReducedMotion = (): boolean =>
  typeof window !== 'undefined' &&
  typeof window.matchMedia === 'function' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

@Component({
  selector: 'app-testimonials',
  imports: [ReactiveFormsModule, ToastComponent],
  templateUrl: './testimonials.component.html',
  styleUrl: './testimonials.component.scss'
})
export class TestimonialsComponent implements OnInit, OnDestroy {
  private readonly formBuilder = inject(FormBuilder);
  private readonly zone = inject(NgZone);
  toastService = inject(ToastService);
  socketService = inject(SocketService);
  private destroy$ = new Subject<void>();

  // ── Template refs (signal queries, so they follow the @if blocks) ──────────
  readonly viewport = viewChild<ElementRef<HTMLElement>>('viewport');
  readonly track = viewChild<ElementRef<HTMLElement>>('track');

  // ── State ──────────────────────────────────────────────────────────────────
  readonly testimonials = signal<Testimonial[]>([]);
  readonly skeletons = [0, 1, 2, 3];

  readonly canLoop = computed(() => this.testimonials().length >= MIN_FOR_LOOP);

  /** Cards in one repeated set (what the scroll engine wraps around). */
  readonly setSize = computed(() => {
    const count = this.testimonials().length;
    if (!count) return 0;
    return this.canLoop() ? count * Math.ceil(MIN_CARDS_PER_SET / count) : count;
  });

  readonly marqueeItems = computed<MarqueeItem[]>(() => {
    const list = this.testimonials();
    if (!list.length) return [];

    if (!this.canLoop()) {
      return list.map((t, i) => this.toItem(t, `${t._id ?? t.name}-${i}`, false));
    }

    const reps = Math.ceil(MIN_CARDS_PER_SET / list.length);
    const items: MarqueeItem[] = [];
    for (let set = 0; set < SET_COUNT; set++) {
      for (let rep = 0; rep < reps; rep++) {
        list.forEach((t, i) => {
          items.push(this.toItem(t, `${t._id ?? t.name}-${i}-${set}-${rep}`, set > 0 || rep > 0));
        });
      }
    }
    return items;
  });

  readonly summary = computed(() => {
    const rated = this.testimonials().filter((t) => (t.rating ?? 0) > 0);
    if (!rated.length) return null;
    const avg = rated.reduce((sum, t) => sum + (t.rating ?? 0), 0) / rated.length;
    const rounded = Math.round(avg * 10) / 10;
    return {
      average: rounded.toFixed(1),
      count: rated.length,
      stars: this.starsFor(Math.round(avg))
    };
  });

  /** false = paused by the user (or by reduced-motion preference). */
  readonly autoPlay = signal<boolean>(!prefersReducedMotion());

  // ── Feedback form ──────────────────────────────────────────────────────────
  feedbackForm = this.formBuilder.group({
    name: ['', Validators.required],
    organization: ['', Validators.required],
    designation: ['', Validators.required],
    rating: [null as number | null, Validators.required],
    message: ['', Validators.required]
  });

  isSubmitting = signal<boolean>(false);
  isSubmitted = signal(false);
  submitError = signal<string>('');
  isLoading = signal<boolean>(true);

  // ── Scroll engine (plain fields: they're touched every animation frame) ────
  private el!: HTMLElement;
  private trackEl!: HTMLElement;
  private pos = 0;
  private lastWritten = 0;
  private setWidth = 0;
  private cardStep = 0;
  private rafId = 0;
  private lastTs = 0;
  private hovering = false;
  private focused = false;
  private dragging = false;
  private dragMoved = false;
  private touching = false;
  private inView = true;
  private lastInteraction = Number.NEGATIVE_INFINITY;
  private dragStartX = 0;
  private dragStartScroll = 0;
  private idleTimer: ReturnType<typeof setTimeout> | null = null;
  private tween: { from: number; to: number; start: number; dur: number } | null = null;

  /** (Re)starts the engine whenever the viewport element appears or is replaced. */
  private readonly engineEffect = effect((onCleanup) => {
    const viewport = this.viewport()?.nativeElement;
    const track = this.track()?.nativeElement;
    if (!viewport || !track) return;
    const teardown = untracked(() => this.attachEngine(viewport, track));
    onCleanup(teardown);
  });

  constructor(
    private readonly feedbackService: FeedbackService,
    public readonly validationService: ValidationService
  ) { }

  ngOnInit(): void {
    this.getFeedbacks();
    this.subscribeToSocketUpdates();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ── Data ───────────────────────────────────────────────────────────────────
  private subscribeToSocketUpdates(): void {
    this.socketService
      .onRefreshOrDataUpdated(['feedback', 'feedbacks'])
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.getFeedbacks(true);
      });
  }

  getFeedbacks(isSilent: boolean = false): void {
    if (!isSilent) {
      this.isLoading.set(true);
    }
    this.feedbackService.getAllFeedback(isSilent).subscribe({
      next: (res: any) => {
        if (res?.success) {
          const data = res?.feedback || [];
          this.testimonials.set(data.filter((item: any) => item.verified === true));
        }
        if (!isSilent) {
          this.isLoading.set(false);
        }
      },
      error: () => {
        if (!isSilent) {
          this.isLoading.set(false);
        }
      }
    });
  }

  private toItem(t: Testimonial, key: string, isClone: boolean): MarqueeItem {
    const rating = t.rating ?? 0;
    return {
      key,
      isClone,
      testimonial: t,
      rating,
      stars: this.starsFor(rating),
      initials: this.initialsFor(t.name)
    };
  }

  private starsFor(rating: number): boolean[] {
    return Array.from({ length: 5 }, (_, i) => i < rating);
  }

  private initialsFor(name: string | undefined): string {
    const parts = (name ?? '').trim().split(/\s+/).filter(Boolean);
    if (!parts.length) return 'U';
    const first = parts[0].charAt(0);
    const last = parts.length > 1 ? parts[parts.length - 1].charAt(0) : '';
    return (first + last).toUpperCase();
  }

  // ── Carousel controls (template-facing) ────────────────────────────────────
  toggleAutoPlay(): void {
    this.autoPlay.update((v) => !v);
    // Starting should feel instant, so skip the resume delay.
    this.lastInteraction = Number.NEGATIVE_INFINITY;
  }

  scrollByCards(direction: 1 | -1): void {
    if (!this.el || !this.cardStep) return;

    const visible = Math.max(1, Math.floor(this.el.clientWidth / this.cardStep));
    const cards = visible > 2 ? visible - 1 : 1;
    let to = this.pos + direction * this.cardStep * cards;

    if (!this.canLoop()) {
      const max = Math.max(0, this.el.scrollWidth - this.el.clientWidth);
      to = Math.min(Math.max(to, 0), max);
    }

    this.tween = { from: this.pos, to, start: performance.now(), dur: 520 };
    this.markInteraction();
  }

  onKeydown(event: KeyboardEvent): void {
    if (event.key === 'ArrowRight') {
      event.preventDefault();
      this.scrollByCards(1);
    } else if (event.key === 'ArrowLeft') {
      event.preventDefault();
      this.scrollByCards(-1);
    }
  }

  // ── Scroll engine internals ────────────────────────────────────────────────
  private attachEngine(viewport: HTMLElement, track: HTMLElement): () => void {
    if (typeof window === 'undefined') {
      return () => { };
    }

    this.el = viewport;
    this.trackEl = track;
    this.pos = 0;
    this.lastWritten = 0;
    this.setWidth = 0;
    this.tween = null;
    this.hovering = this.focused = this.dragging = this.touching = false;
    this.inView = true;

    const cleanups: Array<() => void> = [];
    const on = (
      target: EventTarget,
      type: string,
      fn: (e: any) => void,
      options?: AddEventListenerOptions
    ): void => {
      target.addEventListener(type, fn, options);
      cleanups.push(() => target.removeEventListener(type, fn, options));
    };

    // Everything below runs outside Angular's zone so the animation loop and
    // scroll listeners never trigger change detection.
    this.zone.runOutsideAngular(() => {
      // Pause on hover (mouse only: touch "hover" would stick after a tap)
      on(viewport, 'pointerenter', (e: PointerEvent) => {
        if (e.pointerType === 'mouse') this.hovering = true;
      });
      on(viewport, 'pointerleave', (e: PointerEvent) => {
        if (e.pointerType === 'mouse') this.hovering = false;
      });

      // Pause while the region has keyboard focus
      on(viewport, 'focusin', (e: FocusEvent) => {
        this.focused = (e.target as HTMLElement).matches(':focus-visible');
      });
      on(viewport, 'focusout', () => {
        this.focused = false;
      });

      // Manual input
      on(viewport, 'scroll', this.onScroll, { passive: true });
      on(viewport, 'wheel', this.markInteraction, { passive: true });
      on(viewport, 'touchstart', () => {
        this.touching = true;
        this.tween = null;
        this.markInteraction();
      }, { passive: true });
      const touchEnd = () => {
        this.touching = false;
        this.markInteraction();
      };
      on(viewport, 'touchend', touchEnd, { passive: true });
      on(viewport, 'touchcancel', touchEnd, { passive: true });

      // Mouse drag-to-scroll
      on(viewport, 'pointerdown', this.onPointerDown);
      on(viewport, 'pointermove', this.onPointerMove);
      on(viewport, 'pointerup', this.onPointerUp);
      on(viewport, 'pointercancel', this.onPointerUp);

      on(document, 'visibilitychange', this.syncLoop);

      // Re-measure when layout changes (resize, new testimonial via socket…)
      if (typeof ResizeObserver !== 'undefined') {
        const ro = new ResizeObserver(this.measure);
        ro.observe(viewport);
        ro.observe(track);
        cleanups.push(() => ro.disconnect());
      }

      // Don't burn frames while the section is off-screen
      if (typeof IntersectionObserver !== 'undefined') {
        const io = new IntersectionObserver(([entry]) => {
          this.inView = entry.isIntersecting;
          this.syncLoop();
        });
        io.observe(viewport);
        cleanups.push(() => io.disconnect());
      }

      this.measure();
      this.syncLoop();
    });

    return () => {
      cleanups.forEach((fn) => fn());
      if (this.rafId) cancelAnimationFrame(this.rafId);
      if (this.idleTimer) clearTimeout(this.idleTimer);
      this.rafId = 0;
      this.idleTimer = null;
      this.dragging = false;
    };
  }

  private readonly markInteraction = (): void => {
    this.lastInteraction = performance.now();
  };

  private readonly syncLoop = (): void => {
    const shouldRun = this.inView && !document.hidden && !!this.el;
    if (shouldRun && !this.rafId) {
      this.lastTs = 0;
      this.rafId = requestAnimationFrame(this.tick);
    } else if (!shouldRun && this.rafId) {
      cancelAnimationFrame(this.rafId);
      this.rafId = 0;
    }
  };

  private isAutoRunning(now: number): boolean {
    return (
      this.autoPlay() &&
      this.canLoop() &&
      !this.hovering &&
      !this.focused &&
      !this.dragging &&
      !this.touching &&
      now - this.lastInteraction > RESUME_DELAY
    );
  }

  private readonly tick = (ts: number): void => {
    this.rafId = requestAnimationFrame(this.tick);
    const dt = Math.min(ts - (this.lastTs || ts), 50);
    this.lastTs = ts;

    const tw = this.tween;
    if (tw) {
      const t = Math.min(1, (ts - tw.start) / tw.dur);
      const eased = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
      this.pos = tw.from + (tw.to - tw.from) * eased;
      this.applyPos();
      if (t >= 1) this.tween = null;
    } else if (this.isAutoRunning(ts)) {
      // pos is a float: scrollLeft alone would round and stutter at slow speeds
      this.pos += (AUTO_SPEED * dt) / 1000;
      this.applyPos();
    }
  };

  /** Writes `pos` to the DOM, wrapping it into the middle set when looping. */
  private applyPos(): void {
    const S = this.setWidth;
    if (S && this.canLoop()) {
      if (this.pos >= 2 * S) this.shift(-S);
      else if (this.pos < S) this.shift(S);
    } else {
      const max = Math.max(0, this.el.scrollWidth - this.el.clientWidth);
      this.pos = Math.min(Math.max(this.pos, 0), max);
    }
    this.lastWritten = this.pos;
    this.el.scrollLeft = this.pos;
  }

  private shift(delta: number): void {
    this.pos += delta;
    if (this.tween) {
      this.tween.from += delta;
      this.tween.to += delta;
    }
  }

  /** Any scroll we didn't write ourselves came from the user (touch, wheel, drag, scrollbar). */
  private readonly onScroll = (): void => {
    const x = this.el.scrollLeft;
    if (Math.abs(x - this.lastWritten) <= 2) return;

    this.pos = x;
    this.lastWritten = x;
    this.tween = null;
    this.markInteraction();

    if (this.idleTimer) clearTimeout(this.idleTimer);
    this.idleTimer = setTimeout(this.settle, 160);
  };

  /** After the user stops scrolling, silently jump back into the middle set. */
  private readonly settle = (): void => {
    const S = this.setWidth;
    if (!S || !this.canLoop() || this.dragging) return;
    const x = this.el.scrollLeft;
    if (x >= S && x < 2 * S) return;
    const wrapped = ((((x - S) % S) + S) % S) + S;
    this.pos = wrapped;
    this.lastWritten = wrapped;
    this.el.scrollLeft = wrapped;
  };

  private readonly measure = (): void => {
    const kids = this.trackEl.children;
    if (!kids.length) return;

    const first = kids[0] as HTMLElement;
    const second = kids[1] as HTMLElement | undefined;
    this.cardStep = second ? second.offsetLeft - first.offsetLeft : first.offsetWidth;

    const n = this.setSize();
    if (this.canLoop() && n > 0 && kids.length > n) {
      const nextSet = (kids[n] as HTMLElement).offsetLeft - first.offsetLeft;
      const prev = this.setWidth;
      if (nextSet === prev) return;

      this.setWidth = nextSet;
      // keep the same relative position when card sizes change on resize
      this.pos = prev ? (this.el.scrollLeft / prev) * nextSet : nextSet;
      this.applyPos();
    } else if (this.setWidth) {
      this.setWidth = 0;
      this.pos = 0;
      this.lastWritten = 0;
      this.el.scrollLeft = 0;
    }
  };

  private readonly onPointerDown = (e: PointerEvent): void => {
    if (e.pointerType !== 'mouse' || e.button !== 0) return;
    this.dragging = true;
    this.dragMoved = false;
    this.tween = null;
    this.dragStartX = e.clientX;
    this.dragStartScroll = this.el.scrollLeft;
    this.el.setPointerCapture(e.pointerId);
  };

  private readonly onPointerMove = (e: PointerEvent): void => {
    if (!this.dragging) return;
    const dx = e.clientX - this.dragStartX;
    if (!this.dragMoved) {
      if (Math.abs(dx) < 4) return;
      this.dragMoved = true;
      this.el.classList.add('is-dragging');
    }
    this.el.scrollLeft = this.dragStartScroll - dx; // onScroll picks this up as a user scroll
  };

  private readonly onPointerUp = (e: PointerEvent): void => {
    if (!this.dragging) return;
    this.dragging = false;
    this.el.classList.remove('is-dragging');
    if (this.el.hasPointerCapture(e.pointerId)) {
      this.el.releasePointerCapture(e.pointerId);
    }
    this.markInteraction();
    if (this.idleTimer) clearTimeout(this.idleTimer);
    this.idleTimer = setTimeout(this.settle, 160);
  };

  // ── Feedback form ──────────────────────────────────────────────────────────
  onFeedbackSubmit(): void {
    this.isSubmitted.set(true);

    if (this.feedbackForm.invalid) {
      Object.values(this.feedbackForm.controls).forEach((control) => control.markAsDirty());
      this.feedbackForm.markAllAsTouched();
      return;
    }

    this.isSubmitting.set(true);
    this.submitError.set('');

    const formValue = this.feedbackForm.getRawValue();
    this.feedbackService.createFeedback({
      name: formValue.name ?? '',
      organization: formValue.organization ?? '',
      designation: formValue.designation ?? '',
      rating: formValue.rating ?? 0,
      message: formValue.message ?? ''
    }).subscribe({
      next: () => {
        this.isSubmitting.set(false);
        this.feedbackForm.reset({ rating: null });
        this.isSubmitted.set(false);
        this.hideFeedbackModal();
        this.toastService.show(
          'success',
          'Feedback Sent !',
          `Feedback submitted successfully.`
        );
      },
      error: () => {
        this.isSubmitting.set(false);
        this.toastService.show(
          'error',
          'Failed !',
          `Failed to submit feedback. Please try again.`
        );
      }
    });
  }

  resetFeedbackForm(): void {
    this.feedbackForm.reset({ rating: null });
    this.isSubmitted.set(false);
    this.submitError.set('');
  }

  isControlInvalid(controlName: 'name' | 'organization' | 'designation' | 'rating' | 'message'): boolean {
    const control = this.feedbackForm.get(controlName);
    return !!control && control.invalid && (control.dirty || control.touched || this.isSubmitted());
  }

  private hideFeedbackModal(): void {
    const modalElement = document.getElementById('feedbackModal');
    if (!modalElement) {
      return;
    }

    const bootstrapWindow = window as BootstrapWindow;
    const modalApi = bootstrapWindow.bootstrap?.Modal;
    if (!modalApi) {
      return;
    }

    const modal = modalApi.getOrCreateInstance(modalElement);
    modal.hide();
  }

  onInputChange(event: any, field: string) {
    let value = event.target.value;

    switch (field) {
      case 'name':
        value = this.validationService.onlyCharacters(value);
        value = this.validationService.capitalizeFirstLetter(value);
        break;

      case 'organization':
        value = this.validationService.capitalizeFirstLetter(value);
        break;

      case 'designation':
        value = this.validationService.onlyCharacters(value);
        value = this.validationService.capitalizeFirstLetter(value);
        break;

      case 'message':
        value = this.validationService.capitalizeSentence(value);
        break;
    }

    event.target.value = value;
  }
}