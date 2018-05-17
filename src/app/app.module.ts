import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { MatInputModule, MatFormFieldModule, MatSelectModule } from '@angular/material';
import { AppComponent } from './app.component';
import { NgMdTimeInputModule } from 'ng-md-time-input';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserAnimationsModule,
    BrowserModule,
    CommonModule,
    FormsModule,
    NgMdTimeInputModule,
    MatFormFieldModule,
    MatSelectModule,
    MatInputModule,
    ReactiveFormsModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
