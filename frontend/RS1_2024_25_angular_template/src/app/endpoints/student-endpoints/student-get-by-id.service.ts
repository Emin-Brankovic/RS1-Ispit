import { Injectable } from '@angular/core';
import {FormBuilder} from '@angular/forms';


export interface StudentGetByIdResponse {
  id:number;
  birth_date:Date;
  cityId:number;
  contactMobilePhone:string,
  countryId:number;
}

@Injectable({
  providedIn: 'root'
})

export class StudentGetByIdService {

}
