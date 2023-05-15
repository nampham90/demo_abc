import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NzSafeAny } from 'ng-zorro-antd/core/types';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalRef } from 'ng-zorro-antd/modal';
import { Observable, of } from 'rxjs';
import { WebserviceService } from 'src/app/core/service/webservice.service';
import { fnCheckForm } from 'src/app/utils/tools';

@Component({
  selector: 'app-subwelcom',
  templateUrl: './subwelcom.component.html',
  styleUrls: ['./subwelcom.component.css']
})
export class SubwelcomComponent implements OnInit{

  addEditForm!: FormGroup;
  params!: any;
  isEdit = false;

  constructor(
    private modalRef: NzModalRef,
    private fb: FormBuilder,
    private webService: WebserviceService,
    public message: NzMessageService,
    private cdf: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.initForm();
 
    this.isEdit = Object.keys(this.params).length > 0;
    if (this.isEdit) {
      this.addEditForm.patchValue(this.params);
    }
  }

  protected getCurrentValue(): Observable<NzSafeAny> {
    if (!fnCheckForm(this.addEditForm)) {
      return of(false);
    }
    return of(this.addEditForm.value);
  }

  get f():{ [key: string]: AbstractControl } {
    return this.addEditForm.controls;
  }

  initForm(): void {
    this.addEditForm = this.fb.group({
      tenphongban: [null, [Validators.required]],
      fatherId: [null, [Validators.required]],
    });
  }
}
