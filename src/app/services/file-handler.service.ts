import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, Subject, throwError } from 'rxjs';
import { ProcessDiagram } from '../models/process-diagram.model';

@Injectable({
  providedIn: 'root'
})
export class FileHandlerService {
  
  private readonly reduceEndpoint = 'http://localhost:8080/api/diagramprocess/reduce';

  constructor(private http: HttpClient) {}

  readJsonFile(file: File): Observable<ProcessDiagram[]> {
    const subject = new Subject<ProcessDiagram[]>();
    
    if (!file) {
      return throwError('No file provided');
    }

    if (file.type !== 'application/json' && !file.name.endsWith('.json')) {
      return throwError('Please select a valid JSON file');
    }

    const reader = new FileReader();

    reader.onload = (event: any) => {
      try {
        const content = event.target.result as string;
        const diagram = JSON.parse(content) as ProcessDiagram;

        this.validateDiagramStructure(diagram);

        const headers = new HttpHeaders({ 'Content-Type': 'application/json' });

        this.http.post<ProcessDiagram>(this.reduceEndpoint, diagram, { headers }).subscribe({
          next: (reduced: ProcessDiagram) => {
            const result = [diagram, reduced];
            subject.next(result);
            subject.complete();
          },
          error: (err) => {
            const errorMessage = typeof err === 'string'
              ? err
              : (err?.error?.message || err?.message || 'Backend error while reducing diagram');
            subject.error(errorMessage);
          }
        });
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Error parsing JSON file. Please check the format.';
        subject.error(errorMessage);
      }
    };

    reader.onerror = () => {
      subject.error('Error reading file');
    };

    reader.readAsText(file);
    return subject.asObservable();
  }

  private validateDiagramStructure(diagram: any): void {
    if (!diagram || typeof diagram !== 'object') {
      throw new Error('Invalid JSON structure');
    }

    if (!Array.isArray(diagram.nodes) || !Array.isArray(diagram.edges)) {
      throw new Error('Diagram must contain nodes and edges arrays');
    }

    diagram.nodes.forEach((node: any, index: number) => {
      if (typeof node.id !== 'number' || typeof node.name !== 'string' || typeof node.type !== 'string') {
        throw new Error(`Invalid node structure at index ${index}`);
      }
    });

    diagram.edges.forEach((edge: any, index: number) => {
      if (typeof edge.from !== 'number' || typeof edge.to !== 'number') {
        throw new Error(`Invalid edge structure at index ${index}`);
      }
    });
  }
}
