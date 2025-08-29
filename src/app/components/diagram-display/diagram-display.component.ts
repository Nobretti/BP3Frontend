
import { Component, Input } from '@angular/core';
import { ProcessDiagram } from '../../models/process-diagram.model';

@Component({
  selector: 'app-diagram-display',
  templateUrl: './diagram-display.component.html',
  styleUrls: ['./diagram-display.component.css']
})
export class DiagramDisplayComponent {
  @Input() diagram: ProcessDiagram | any;
  @Input() title: string | any;
  @Input() isReduced: boolean = false;

  formatJson(obj: any): string {
    console.log("Trying to display: ", obj);
    return JSON.stringify(obj, null, 2);
  }
}