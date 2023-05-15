


import { HttpClient, HttpHeaders, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

export interface Product {
  id: number;
  title: string;
  price: string;
  description: string;
  category: string;
  image: string;
  rating: Object | any;
}
export interface  ObjectDataSC{
  stt : string;
  title1 : string;
  title2 : string;
}   
@Injectable({
  providedIn: 'root'
})
export class WebserviceService {
  urlApi = 'https://fakestoreapi.com/';
  constructor(
    private httpt: HttpClient
  ) { 
    
  }
  
  uri = "http://localhost:3000/";

  httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json',
    }),
  };


  async PostCallWs(serviceName: string, data: any,
    fncSuccess?: ((data: any) => any),
     fncError?: (() => any)): Promise<Observable<HttpResponse<any>>> {
    let promisr = this.httpt.post<any>(this.uri + serviceName, data, { observe: 'response' });
    promisr.subscribe({
      next: (res: any) => {
        if(fncSuccess != null){
           fncSuccess(res['body']['data']);
        }
        return true;
      },
      error: (err: any) => {
         if(fncError != null){
           fncError();
         }
         return false;
      },
      complete: ()=> {}
    })
    return promisr;
  }

}

