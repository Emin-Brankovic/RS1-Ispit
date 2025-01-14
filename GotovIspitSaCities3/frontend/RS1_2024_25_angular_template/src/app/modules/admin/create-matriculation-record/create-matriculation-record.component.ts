import {AfterViewInit, Component, inject, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {ActivatedRoute} from '@angular/router';
import {HttpClient} from '@angular/common/http';
import {MyConfig} from '../../../my-config';
import {MatTableDataSource} from '@angular/material/table';
import {Record} from '../matriculation-record/matriculation-record.component';

@Component({
  selector: 'app-create-matriculation-record',
  standalone: false,

  templateUrl: './create-matriculation-record.component.html',
  styleUrl: './create-matriculation-record.component.css'
})
export class CreateMatriculationRecordComponent implements OnInit{


  ngOnInit(): void {
      this.fetchAcademicYears();
      this.fetchRecords();
  }

  fb=inject(FormBuilder);
  route=inject(ActivatedRoute);
  httpClient:HttpClient=inject(HttpClient);


  studentId=this.route.snapshot.params['id'];

  recordForm=this.fb.group({
    date:[null, Validators.required],
    academicYearId:['', Validators.required],
    year:[null, Validators.required],
    tuitionFees:[{ value: 0, disabled: true }, Validators.required],
    repeat:[{ value: false, disabled: true }, Validators.required],
    studentId:[this.studentId,Validators.required],
  })

  academicYears:any[]=[];
  record:Record[]=[];

  private readonly _currentYear = new Date().getFullYear();
  private readonly _currentDate = new Date();
  readonly minDate = new Date(this._currentYear - 40, 0, 1);
  readonly maxDate = new Date(this._currentYear + 1, 11, 31) > this._currentDate
    ? this._currentDate
    : new Date(this._currentYear + 1, 11, 31)

  fetchAcademicYears(){
    this.httpClient.get(`${MyConfig.api_address}/MatriculationRecord/GetAllAcademicYears`).subscribe({
         next:(res:any)=>{
           this.academicYears=res.map((year: any) => ({
             id: year.id,
             name: year.description, // Use 'description' as the displayed name
           }));
         }
    })
  }

  checkForRepeat(){

    let selectedYear=Number.parseInt(this.recordForm.get('year')?.value || '0');
    let isYearRepeat=this.record.find(r=>r.godinaStudija==selectedYear)?true:false;

    //ovo ako ostavis blank godinu studija
    if(selectedYear==0 || selectedYear==undefined){
      this.recordForm.patchValue({
        repeat: false,
        tuitionFees: 0
      })
      return;
    }

    if(isYearRepeat){
      this.recordForm.patchValue({
        repeat: true,
        tuitionFees: 400
      })
    }
    else{
      this.recordForm.patchValue({
        repeat: false,
        tuitionFees: 1800
      })
    }

  }

  fetchRecords(){
    this.httpClient.get<Record[]>(`${MyConfig.api_address}/MatriculationRecord/GetAllRecords/${this.studentId}`).subscribe({
      next:res=>{
        this.record=res;
        console.log(this.record);
      },
      error:err=>{console.log(err)}
    })
  }

  createRecord(){
      console.log(this.recordForm.value);
      const year={
        ...this.recordForm.getRawValue(),
      }


      //ovo prevodim jer sam u backendu napisao na bosanskom a ovdje na engleskom pa se ne mapira fino datum
      // ali radi ugl
      const godina={
        studentId:this.studentId,
        akademskaGodinaId:year.academicYearId,
        obnovaGodine:year.repeat,
        cijenaSkolarine:year.tuitionFees,
        godinaStudija:year.year,
        datum1_ZimskiUpis:year.date,
      }

      console.log(godina);

      this.httpClient.post(`${MyConfig.api_address}/MatriculationRecord/CreatRecord`,godina).subscribe({
        next:(res:any)=>{}
      })
  }
}


