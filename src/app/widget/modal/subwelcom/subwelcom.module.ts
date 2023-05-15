import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SubwelcomComponent } from './subwelcom.component';
import { SharedModule } from 'src/app/shared/shared.module';



@NgModule({
  declarations: [
    SubwelcomComponent
  ],
  imports: [
    SharedModule
  ]
})
export class SubwelcomModule { }
