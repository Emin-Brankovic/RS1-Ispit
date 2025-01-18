import {AfterViewInit, Component, inject, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {HttpClient} from '@angular/common/http';
import {ActivatedRoute} from '@angular/router';
import {MyConfig} from '../../../my-config';
import {
  CountryGetAllEndpointService,
  CountryGetAllResponse
} from '../../../endpoints/country-endpoints/country-get-all-endpoint.service';

// @ts-ignore
@Component({
  selector: 'app-student-edit',
  standalone: false,

  templateUrl: './student-edit.component.html',
  styleUrl: './student-edit.component.css'
})
export class StudentEditComponent implements OnInit, AfterViewInit {

  ngAfterViewInit(): void {

  }
  ngOnInit(): void {
      this.studentId=this.route.snapshot.params['id'];

    this.fetchCountries();
    if(this.studentId){
      this.fetchStudent();
    }

    this.studentEditForm.get('countryId')?.valueChanges.subscribe({
      next: values => {
        const countryId = Number.parseInt(this.studentEditForm.get('countryId')?.value || '0');
        this.fetchMunicipalitiesByCountryId(countryId)
      }
    })
  }
  fb=inject(FormBuilder);
  httpClient=inject(HttpClient);
  route=inject(ActivatedRoute);
  studentId:number=0;
  student:any={};
  countryService=inject(CountryGetAllEndpointService);
  municipalities:any[]=[]


  studentEditForm=this.fb.group({
    birthDate:['', Validators.required],
    phoneNumber:['', [Validators.required,Validators.pattern(/^06\d-\d{3}-\d{3}$/)]],
    municipalityId:['', Validators.required],
    countryId:['', Validators.required],
  });
  countries: CountryGetAllResponse[]= [];

  private readonly _currentYear = new Date().getFullYear();
  private readonly _currentDate = new Date();
  readonly minDate = new Date(this._currentYear - 40, 0, 1);
  readonly maxDate=true
    ?this._currentDate : new Date(this._currentYear +1,11,31)

  updateStudent() {

    const editedStudent={... this.studentEditForm.value};

    this.httpClient.post(`${MyConfig.api_address}/Student/EditStudent/${this.studentId}`,editedStudent).subscribe({
      next: (data) => {
        console.log("Edited student");
      }
    })
  }

  fetchStudent() {
    this.httpClient.get(`${MyConfig.api_address}/Student/GetStudentByIdForEdit/${this.studentId}`).subscribe({
      next: (data) => {
        this.student = data;
        console.log(this.student);
        this.initForm()
        this.fetchMunicipalitiesByCountryId(this.student.countryId);
      }
    })
  }

  fetchCountries(){
    this.countryService.handleAsync().subscribe({
      next:data=>{
        this.countries = data;
        console.log(this.countries)
      },
      error: (error) => {
        console.error('Error loading countries', error)
      }
    })
  }

  fetchMunicipalitiesByCountryId(countryId:number){
    this.httpClient.get<any[]>(`${MyConfig.api_address}/Student/GetMunicipalitiesForStudentEditByCountryId/countryId/${countryId}`)
      .subscribe({
        next:data=>{
          console.log("Data",data)
          this.municipalities=data;
          console.log("Municipalities",this.municipalities);
        }
      })
  }

  initForm(){
    this.studentEditForm.patchValue({
      countryId: this.student.countryId,
      municipalityId: this.student.municipalityId,
      phoneNumber: this.student.phoneNumber,
      birthDate: this.student.birthDate
    })

    console.log(this.studentEditForm.value)
  }
}
