import {Component, OnInit} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {HttpClient} from '@angular/common/http';
import {StudentGetAllResponse} from '../../../endpoints/student-endpoints/student-get-all-endpoint.service';
import {MyConfig} from '../../../my-config';
import {StudentGetByIdResponse} from '../../../endpoints/student-endpoints/student-get-by-id.service';
import {
  CountryGetAllEndpointService,
  CountryGetAllResponse
} from '../../../endpoints/country-endpoints/country-get-all-endpoint.service';
import {
  RegionGetAllEndpointService,
  RegionGetAllResponse
} from '../../../endpoints/region-endpoints/region-get-all-endpoint.service';
import {
  CityGetAll1EndpointService,
  CityGetAll1Response
} from '../../../endpoints/city-endpoints/city-get-all1-endpoint.service';

@Component({
  selector: 'app-student-edit',
  standalone: false,

  templateUrl: './student-edit.component.html',
  styleUrl: './student-edit.component.css'
})
export class StudentEditComponent implements OnInit {
    constructor(
      private route:ActivatedRoute,
      private fb: FormBuilder,
      private httpClient:HttpClient,
      private cityGetAllEndpointService:CityGetAll1EndpointService,
      private regionGetAllService: RegionGetAllEndpointService,) {
      this.studentId=0;
      this.studentForm=this.fb.group({
        id:[0,[Validators.required]],
        cityId:[0,[Validators.required]],
        regionId:[0,[Validators.required]],
        contactPhoneNumber:['',[Validators.required,Validators.pattern('06d-ddd-ddd')]],
        birthDate:[null, [Validators.required]],
      })
    }



  studentId: number=0;
    studentForm: FormGroup;
  regions: RegionGetAllResponse[] = [];
  cities:CityGetAll1Response[]=[];
  student:any={};

  ngOnInit(): void {
        this.studentId = this.route.snapshot.params['id'];
        this.fetchRegions();
        this.fetchStudent();
        this.fetchCities();
      }

    fetchStudent() {
        this.httpClient.get<StudentGetByIdResponse>(`${MyConfig.api_address}//students/${this.studentId}`).subscribe({
          next: (response) => {
            this.studentForm.patchValue({
              id: response.id,
              cityId:response.cityId,
              birthDate:response.birth_date,
              contactPhoneNumber:response.contactMobilePhone,
              regionId:response.countryId
            })
            this.student=response;
          },
          error: (error) => {console.log(error)}
        })
    }

    fetchRegions(){
        this.regionGetAllService.handleAsync(this.student.countryId).subscribe({
          next:res=>{
            this.regions=res;
          },
          error: (error) => {console.log(error)}
        })
    }

    fetchCities(){
      this.cityGetAllEndpointService.handleAsync().subscribe({
        next:(response) => {this.cities=response;},
      })
    }


}
