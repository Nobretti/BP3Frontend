import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { FileHandlerService } from './file-handler.service';
import { ProcessDiagram } from '../models/process-diagram.model';

describe('FileHandlerService', () => {
  let service: FileHandlerService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule]
    });
    service = TestBed.inject(FileHandlerService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  function createFile(contents: object, name = 'diagram.json'): File {
    const blob = new Blob([JSON.stringify(contents)], { type: 'application/json' });
    return new File([blob], name, { type: 'application/json' });
  }

  it('posts parsed JSON to backend and emits [original, reduced]', (done) => {
    const original: ProcessDiagram = { nodes: [], edges: [] } as any;
    const reduced: ProcessDiagram = { nodes: [{ id: 1, name: 'A', type: 'HumanTask' }], edges: [] } as any;
    const file = createFile(original);

    const mockReader: any = {
      onload: null,
      onerror: null,
      readAsText: function(_: File) {
        const content = JSON.stringify(original);
        if (this.onload) {
          this.onload({ target: { result: content } });
        }
      }
    };
    spyOn(window as any, 'FileReader').and.returnValue(mockReader);

    service.readJsonFile(file).subscribe({
      next: (result) => {
        expect(result[0]).toEqual(original);
        expect(result[1]).toEqual(reduced);
        done();
      },
      error: done.fail
    });

    const req = httpMock.expectOne('http://localhost:8080/api/diagramprocess/reduce');
    expect(req.request.method).toBe('POST');
    req.flush(reduced);
  });

  it('emits error when backend fails', (done) => {
    const original: ProcessDiagram = { nodes: [], edges: [] } as any;
    const file = createFile(original);

    const mockReader: any = {
      onload: null,
      onerror: null,
      readAsText: function(_: File) {
        const content = JSON.stringify(original);
        if (this.onload) {
          this.onload({ target: { result: content } });
        }
      }
    };
    spyOn(window as any, 'FileReader').and.returnValue(mockReader);

    service.readJsonFile(file).subscribe({
      next: () => done.fail('expected error'),
      error: (err) => {
        expect(err).toContain('boom');
        done();
      }
    });

    const req = httpMock.expectOne('http://localhost:8080/api/diagramprocess/reduce');
    req.flush({ message: 'boom' }, { status: 500, statusText: 'Server Error' });
  });
});


