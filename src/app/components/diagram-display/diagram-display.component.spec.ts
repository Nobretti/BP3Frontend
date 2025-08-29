import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DiagramDisplayComponent } from './diagram-display.component';

describe('DiagramDisplayComponent', () => {
  let component: DiagramDisplayComponent;
  let fixture: ComponentFixture<DiagramDisplayComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [DiagramDisplayComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(DiagramDisplayComponent);
    component = fixture.componentInstance;
  });

  it('should render formatted JSON when diagram has nodes', () => {
    component.title = 'Reduced Diagram (Human Tasks Only)';
    component.diagram = { nodes: [{ id: 1, name: 'A', type: 'HumanTask' }], edges: [] } as any;
    fixture.detectChanges();
    const pre = fixture.nativeElement.querySelector('pre');
    expect(pre.textContent).toContain('HumanTask');
  });

  it('should render empty message when no nodes', () => {
    component.title = 'Reduced Diagram (Human Tasks Only)';
    component.diagram = { nodes: [], edges: [] } as any;
    fixture.detectChanges();
    const msg = fixture.nativeElement.querySelector('.empty-diagram');
    expect(msg.textContent).toContain('No diagram data to display');
  });
});


