import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';

import { AppComponent } from './app.component';
import { FileUploadComponent } from './components/file-upload/file-upload.component';
import { DiagramDisplayComponent } from './components/diagram-display/diagram-display.component';
import { ErrorDisplayComponent } from './components/error-display/error-display.component';

import { FileHandlerService } from './services/file-handler.service';

@NgModule({
  declarations: [
    AppComponent,
    FileUploadComponent,
    DiagramDisplayComponent,
    ErrorDisplayComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule
  ],
  providers: [
    FileHandlerService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
