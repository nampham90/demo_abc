/* eslint-disable prettier/prettier */
import { DragDrop, DragRef } from '@angular/cdk/drag-drop';
import { Injectable, Injector, Renderer2, RendererFactory2, TemplateRef, Type } from '@angular/core';
import { Observable, of } from 'rxjs';
import { first, tap } from 'rxjs/operators';

import { fnGetUUID } from 'src/app/utils/tools';
import * as _ from 'lodash';
import { NzSafeAny } from 'ng-zorro-antd/core/types';
import { ModalButtonOptions, ModalOptions, NzModalRef, NzModalService } from 'ng-zorro-antd/modal';

interface ModalZIndex {
  zIndex: number;
  canChange: boolean;
}

export const enum ModalBtnStatus {
  Cancel,
  Ok
}

// Thể hiện thành phần cần phải kế thừa lớp này
export abstract class BasicConfirmModalComponent {
  protected params: NzSafeAny; // service传给component instance的参数
  protected constructor(protected modalRef: NzModalRef) {}

  protected abstract getCurrentValue(): NzSafeAny;
}

@Injectable()
export class ModalWrapService {
  protected bsModalService: NzModalService;
  private btnTpl!: TemplateRef<any>;
  fullScreenFlag = false;
  private renderer: Renderer2;

  constructor(private baseInjector: Injector, public dragDrop: DragDrop, rendererFactory: RendererFactory2) {
    this.bsModalService = this.baseInjector.get(NzModalService);
    this.renderer = rendererFactory.createRenderer(null, null);
  }

  fullScreenIconClick(): void {
    this.fullScreenFlag = !this.fullScreenFlag;
    this.bsModalService.openModals.forEach(modal => {
      if (this.fullScreenFlag) {
        this.renderer.addClass(modal.containerInstance['host'].nativeElement, 'fullscreen-modal');
      } else {
        this.renderer.removeClass(modal.containerInstance['host'].nativeElement, 'fullscreen-modal');
      }
    });
  }

  setTemplate(btnTpl: TemplateRef<any>): void {
    this.btnTpl = btnTpl;
  }

  protected getRandomCls() {
    return `NZ-MODAL-WRAP-CLS-${fnGetUUID()}`;
  }

  private cancelCallback(modalButtonOptions: ModalButtonOptions): void {
    return modalButtonOptions['modalRef'].destroy({ status: ModalBtnStatus.Cancel, value: null });
  }

  private confirmCallback(modalButtonOptions: ModalButtonOptions): void {
    (modalButtonOptions['modalRef'].componentInstance as NzSafeAny)
      .getCurrentValue()
      .pipe(
        tap(modalValue => {
          if (!modalValue) {
            return of(false);
          } else {
            return modalButtonOptions['modalRef'].destroy({ status: ModalBtnStatus.Ok, modalValue });
          }
        })
      )
      .subscribe();
  }

  getZIndex(element: HTMLElement): number {
    return +getComputedStyle(element, null).zIndex;
  }

/**
 *Lấy giá trị tối đa của tất cả các hộp thoại và xác định xem có cần chỉnh sửa hay không
  @param wrapElement: Đối tượng chứa z-index cần chỉnh sửa
*/
  getModalMaxZIndex(wrapElement: HTMLElement): ModalZIndex {
    return this.bsModalService.openModals.reduce<ModalZIndex>(
      (prev, modal) => {
        const element = modal.containerInstance['host'].nativeElement;
        if (wrapElement === element) {
          return prev;
        }
        const zIndex = this.getZIndex(element);
        if (zIndex >= prev.zIndex) {
          prev.zIndex = zIndex;
          prev.canChange = true;
        }
        return prev;
      },
      { zIndex: this.getZIndex(wrapElement), canChange: false! }
    );
  }

  // Khi bật bảng hội thoại, đặt z-index của hộp thoại hiện tại là lớn nhất.
  protected setMaxZIndex(wrapElement: HTMLElement): void {
    wrapElement.addEventListener(
      'mousedown',
      () => {
        const modalZIndex = this.getModalMaxZIndex(wrapElement);
        if (modalZIndex.canChange) {
          wrapElement.style.zIndex = `${modalZIndex.zIndex + 1}`;
        }
      },
      false
    );
  }

  protected createDrag<T = NzSafeAny>(wrapCls: string): DragRef<T> | null {
    const wrapElement = document.querySelector<HTMLDivElement>(`.${wrapCls}`)!;

    const rootElement = wrapElement.querySelector<HTMLDivElement>(`.ant-modal-content`)!;
    const handle = rootElement.querySelector<HTMLDivElement>('.ant-modal-header')!;
    const modalZIndex = this.getModalMaxZIndex(wrapElement);
    if (modalZIndex.canChange) {
      wrapElement.style.zIndex = `${modalZIndex.zIndex + 1}`;
    }
    // this.fixedWrapElementStyle(wrapElement);
    this.setMaxZIndex(wrapElement);
    if (handle) {
      handle.className += ' hand-model-move';
      return this.dragDrop.createDrag(handle).withHandles([handle]).withRootElement(rootElement);
    }
    return this.dragDrop.createDrag(rootElement).withHandles([rootElement]);
  }

  protected fixedWrapElementStyle(wrapElement: HTMLElement): void {
    wrapElement.style.pointerEvents = 'none';
  }

  // Tạo cấu hình cho hộp thoại
  createModalConfig(component: Type<NzSafeAny>, modalOptions: ModalOptions = {}, params: object = {}, wrapCls: string): ModalOptions {
    let str=JSON.stringify(params);
    let obj = JSON.parse(str);
    let showCf = false;
    if(obj['showcomfirm'] != undefined){
      showCf = obj['showcomfirm'];
    } else {
      showCf = true;
    }
    const defaultOptions: ModalOptions = {
      nzTitle: '',
      nzContent: component,
      nzCloseIcon: this.btnTpl,
      nzMaskClosable: false,
      nzFooter: [
        {
          label: 'Xác nhận',
          type: 'primary',
          show: showCf,
          onClick: this.confirmCallback.bind(this)
        },
        {
          label: 'Hủy',
          type: 'default',
          show: true,
          onClick: this.cancelCallback.bind(this)
        }
      ],
      nzOnCancel: () => {
        return new Promise(resolve => {
          resolve({ status: ModalBtnStatus.Cancel, value: null });
        });
      },
      nzClosable: true,
      nzWidth: 720,
      nzComponentParams: {
        params
      } //Các thuộc tính trong tham số sẽ được truyền vào thể hiện nzContent
    };

    const newOptions = _.merge(defaultOptions, modalOptions);
    newOptions.nzWrapClassName = `${newOptions.nzWrapClassName || ''} ${wrapCls}`;
    return newOptions;
  }

  show(component: Type<NzSafeAny>, modalOptions: ModalOptions = {}, params: object = {}): Observable<NzSafeAny> {
    const wrapCls = this.getRandomCls();
    const newOptions = this.createModalConfig(component, modalOptions, params, wrapCls);
    const modalRef = this.bsModalService.create(newOptions);
    let drag: DragRef | null;
    modalRef.afterOpen.pipe(first()).subscribe(() => {
      drag = this.createDrag(wrapCls);
    });

    return modalRef.afterClose.pipe(
      tap(() => {
        drag!.dispose();
        drag = null;
        this.fullScreenFlag = false;
      })
    );
  }
}
