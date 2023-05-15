import { NgModule } from '@angular/core';
import { WelcomeRoutingModule } from './welcome-routing.module';
import { WelcomeComponent } from './welcome.component';
import { SharedModule } from 'src/app/shared/shared.module';
import { SubwelcomModule } from 'src/app/widget/modal/subwelcom/subwelcom.module';


@NgModule({
  imports: [
    SharedModule,
    WelcomeRoutingModule,
    SubwelcomModule
  ],
  declarations: [WelcomeComponent],
  exports: [WelcomeComponent]
})
export class WelcomeModule { }
