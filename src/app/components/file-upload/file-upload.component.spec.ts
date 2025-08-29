import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FileUploadComponent } from './file-upload.component';
import { FileHandlerService } from '../../services/file-handler.service';
import { of, throwError } from 'rxjs';

describe('FileUploadComponent', () => {
  let component: FileUploadComponent;
  let fixture: ComponentFixture<FileUploadComponent>;
  let serviceSpy: jasmine.SpyObj<FileHandlerService>;

  beforeEach(async () => {
    serviceSpy = jasmine.createSpyObj('FileHandlerService', ['readJsonFile']);

    await TestBed.configureTestingModule({
      declarations: [FileUploadComponent],
      providers: [{ provide: FileHandlerService, useValue: serviceSpy }]
    }).compileComponents();

    fixture = TestBed.createComponent(FileUploadComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  function createFile(contents: object, name = 'diagram.json'): File {
    const blob = new Blob([JSON.stringify(contents)], { type: 'application/json' });
    return new File([blob], name, { type: 'application/json' });
  }

  it('emits original and reduced diagrams on success', (done) => {
    const original = { nodes: [], edges: [] } as any;
    const reduced = { nodes: [], edges: [] } as any;
    serviceSpy.readJsonFile.and.returnValue(of([original, reduced]));

    const file = createFile(original);
    const input = document.createElement('input');
    input.type = 'file';
    Object.defineProperty(input, 'files', { value: [file] });

    const originalSpy = spyOn(component.originalDiagram, 'emit');
    const reducedSpy = spyOn(component.reducedDiagram, 'emit');
    const errorSpy = spyOn(component.error, 'emit');

    component.onFileSelected({ target: input } as any);

    expect(originalSpy).toHaveBeenCalledWith(original);
    expect(reducedSpy).toHaveBeenCalledWith(reduced);
    expect(errorSpy).toHaveBeenCalledWith('');
    done();
  });

  it('emits error on failure', (done) => {
    serviceSpy.readJsonFile.and.returnValue(throwError(() => 'Backend error while reducing diagram'));
    const file = createFile({});
    const input = document.createElement('input');
    input.type = 'file';
    Object.defineProperty(input, 'files', { value: [file] });

    const errorSpy = spyOn(component.error, 'emit');
    component.onFileSelected({ target: input } as any);
    expect(errorSpy).toHaveBeenCalledWith('Backend error while reducing diagram');
    done();
  });
});


