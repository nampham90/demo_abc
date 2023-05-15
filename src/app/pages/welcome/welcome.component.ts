import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { WebserviceService } from 'src/app/core/service/webservice.service';

import * as Const from "src/app/common/Const";
import { SubwelcomService } from 'src/app/widget/modal/subwelcom/subwelcom.service';
import { ModalBtnStatus } from 'src/app/widget/base-modal';

@Component({
  selector: 'app-welcome',
  templateUrl: './welcome.component.html',
  styleUrls: ['./welcome.component.css']
})
export class WelcomeComponent implements OnInit {
  listOfData: any[] = [];
  constructor(
    private webService: WebserviceService,
    private cdf: ChangeDetectorRef,
    private madalService: SubwelcomService
  ) { }

  ngOnInit() {
    this.getDataList();
  }

  edit(id:any, tenphongban: any, fatherId: any) {
     let req = {
       id: id,
       tenphongban: tenphongban,
       fatherId: fatherId
     }
     this.madalService.show({nzTitle: "Update"},req).subscribe(({ modalValue, status }) => {
        if (status === ModalBtnStatus.Cancel) {
          return;
        }
        modalValue.id = id;

      
     })
  }
  del(id:any) {
    console.log(id);
  }

  getDataList() {
    let req = {
      pageNum : 0,
      pageSize: 0
    }
    this.webService.PostCallWs(Const.Ant100getAllPhongban,req, (response) => {
      const {list} = response;
      if (Array.isArray(list)) {
        this.listOfData = [...list];
        this.cdf.markForCheck();
      }
    })
  }

}
