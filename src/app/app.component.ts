import { Component } from '@angular/core';
import { ProcessDiagram } from './models/process-diagram.model';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  originalDiagram: ProcessDiagram | null = null;
  reducedDiagram: ProcessDiagram | null = null;
  errorMessage: string = '';

  onError(error: string): void {
    //If is an error clean diagrams
    if(error != ''){
      this.originalDiagram = null;
      this.reducedDiagram = null;
    }
    this.errorMessage = error;
  }

  updateOriginalDiagram(originalDiagram: ProcessDiagram): void{
    this.originalDiagram = originalDiagram;
  }

  updateReducedDiagram(reducedDiagram: ProcessDiagram): void{
    this.reducedDiagram = reducedDiagram;
  }
}
