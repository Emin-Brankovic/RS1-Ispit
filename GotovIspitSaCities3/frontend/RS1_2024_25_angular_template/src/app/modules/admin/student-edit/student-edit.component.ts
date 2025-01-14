import {AfterViewInit, Component, inject, OnDestroy, OnInit} from '@angular/core';
import {FormBuilder, FormControl, Validators} from '@angular/forms';
import {
  RegionGetAllEndpointService,
  RegionGetAllResponse
} from '../../../endpoints/region-endpoints/region-get-all-endpoint.service';
import {
  CityGetAll1EndpointService,
  CityGetAll1Response
} from '../../../endpoints/city-endpoints/city-get-all1-endpoint.service';
import {CountryGetAllEndpointService} from '../../../endpoints/country-endpoints/country-get-all-endpoint.service';
import {HttpClient} from '@angular/common/http';
import {MyConfig} from '../../../my-config';
import {ActivatedRoute} from '@angular/router';
import {concatMap, Observable} from 'rxjs';

@Component({
  selector: 'app-student-edit',
  standalone: false,

  templateUrl: './student-edit.component.html',
  styleUrl: './student-edit.component.css'
})
export class StudentEditComponent implements OnInit,AfterViewInit {
  ngAfterViewInit(): void {
    this.studentEditForm.get('regionId')?.valueChanges.subscribe({
      next:res=>this.loadCitiesForRegion()
    })
  }
  ngOnInit(): void {
      this.studentId=this.route.snapshot.params['id'];
      console.log(this.studentId);
      this.fetchRegions();

      this.getStudentAndCity().subscribe({
        next:res=>{
          this.cities = res;
          console.log(this.cities);
          this.loadStudentData();
        }
      })
  }

  fb=inject(FormBuilder);
  route=inject(ActivatedRoute);
  httpClient=inject(HttpClient);
  regionsService=inject(RegionGetAllEndpointService);
  student:any;
  studentId:any;

  getStudentAndCity():Observable<any>{
    return this.fetchStudent().pipe(
      concatMap(s=>{
        this.student=s;
        console.log(this.student)
        return this.fetchCitiesByRegion(this.student.regionId);
      })
    );
  }

  loadCitiesForRegion(){
    this.fetchCitiesByRegion(this.studentEditForm.get('regionId')?.value).subscribe({
      next:res=>this.cities = res,
    });
  }


  regions:any;
  cities:any;

  studentEditForm=this.fb.group({
    birthDate: ['', [Validators.required]],
    phoneNumber: ['', [Validators.required,Validators.pattern(/^06\d-\d{3}-\d{3}$/)]],
    regionId:['', [Validators.required]],
    cityId:['', [Validators.required]],
  })

  private readonly _currentYear = new Date().getFullYear();
  private readonly _currentDate = new Date();
  readonly minDate = new Date(this._currentYear - 40, 0, 1);
  readonly maxDate = new Date(this._currentYear + 1, 11, 31) > this._currentDate
    ? this._currentDate
    : new Date(this._currentYear + 1, 11, 31)

  fetchCitiesByRegion(regionId:any){
    return this.httpClient.get(`${MyConfig.api_address}/Student/getCitiesByRegion/cityByRegion/${regionId}`)
  }

  fetchStudent(){
    console.log(this.studentId);
    return this.httpClient.get(`${MyConfig.api_address}/Student/getStudentById/studentID${this.studentId}`)
  }

  fetchRegions(){
      this.httpClient.get(`${MyConfig.api_address}/Student/getRegions`).subscribe({
        next:res=>{
          this.regions=res;
          console.log(this.regions.length);
        }
      })
  }


  loadStudentData(){
    this.studentEditForm.patchValue({
      birthDate: this.student.birthDate,
      phoneNumber: this.student.phoneNumber,
      regionId:this.student.regionId,
      cityId: this.cities[0].id
    })
  }

  editStudent() {

    const studentEdit={
      id:this.studentId,
      ...this.studentEditForm.value,
    }
    console.log(studentEdit);
    this.httpClient.put(`${MyConfig.api_address}/Student/EditStudent/edit/${this.studentId}`,studentEdit).subscribe({
      next:res=>{

      }
    })
  }
}
