import { TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { AppComponent } from './app.component';

describe('AppComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AppComponent],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it('should initialize state variables', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app.originalDiagram).toBeNull();
    expect(app.reducedDiagram).toBeNull();
    expect(app.errorMessage).toBe('');
  });

  it('should render heading', () => {
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('h1')?.textContent).toContain('BP3 Process Diagram Reducer');
  });

  it('should update diagrams on events', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    const original = { nodes: [], edges: [] };
    const reduced = { nodes: [], edges: [] };
    app.updateOriginalDiagram(original as any);
    app.updateReducedDiagram(reduced as any);
    expect(app.originalDiagram).toEqual(original as any);
    expect(app.reducedDiagram).toEqual(reduced as any);
  });
});
