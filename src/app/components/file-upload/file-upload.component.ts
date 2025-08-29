import { Component, Output, EventEmitter, ViewChild, ElementRef } from '@angular/core';
import { FileHandlerService } from '../../services/file-handler.service';
import { ProcessDiagram } from '../../models/process-diagram.model';

@Component({
  selector: 'app-file-upload',
  templateUrl: './file-upload.component.html',
  styleUrls: ['./file-upload.component.css']
})
export class FileUploadComponent {
  @Output() error = new EventEmitter<string>();
  @Output() originalDiagram = new EventEmitter<ProcessDiagram>();
  @Output() reducedDiagram = new EventEmitter<ProcessDiagram>();
  @ViewChild('fileInput', { static: true }) fileInput: ElementRef | any;

  constructor(private fileHandlerService: FileHandlerService) {}

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) {
      return;
    }

    const file = input.files[0];
    
    this.fileHandlerService.readJsonFile(file).subscribe({
      next: (diagramsReduced: ProcessDiagram[]) => {
        console.log("Original: ", diagramsReduced[0], ", Reduced: ", diagramsReduced[1])
        this.originalDiagram.emit(diagramsReduced[0]);
        this.reducedDiagram.emit(diagramsReduced[1]);
        this.error.emit('');
        // Clear the file input after successful upload
        if (input) {
          input.value = '';
        }
      },
      error: (errorMessage: string) => {
        console.error('File upload component: error occurred:', errorMessage);
        this.error.emit(errorMessage);
        // Clear the file input on error too
        if (input) {
          input.value = '';
        }
      }
    });
  }

  triggerFileInput(): void {
    this.fileInput.nativeElement.click();
  }
}