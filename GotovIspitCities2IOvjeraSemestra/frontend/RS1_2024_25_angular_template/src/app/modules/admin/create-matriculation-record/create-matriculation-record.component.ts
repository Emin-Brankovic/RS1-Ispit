import {Component, inject, OnInit} from '@angular/core';
import {FormBuilder, Validators} from '@angular/forms';
import {HttpClient} from '@angular/common/http';
import {MyConfig} from '../../../my-config';
import {MatTableDataSource} from '@angular/material/table';
import {Record} from '../matriculation-record/matriculation-record.component';
import {ActivatedRoute} from '@angular/router';

@Component({
  selector: 'app-create-matriculation-record',
  standalone: false,

  templateUrl: './create-matriculation-record.component.html',
  styleUrl: './create-matriculation-record.component.css'
})
export class CreateMatriculationRecordComponent implements OnInit{
  ngOnInit(): void {
      this.studentId=this.route.snapshot.params['id'];
      this.fetchAcademicYears();
      this.fetchRecords();

      this.recordForm.get('godinaStudija')?.valueChanges.subscribe((year)=>{
        this.PopulateFeesAndRepeat(year);
      })
  }

  fb=inject(FormBuilder);
  route=inject(ActivatedRoute);
  httpClient=inject(HttpClient);

  recordForm=this.fb.group({
    datum1_ZimskiUpis:[null,Validators.required],
    godinaStudija:[null,[Validators.required,Validators.min(1),Validators.max(5)]],
    akademskaGodinaId:[null,Validators.required],
    cijenaSkolarine:[{disabled:true,value:0},Validators.required],
    obnovaGodine:[{ value: false, disabled: true }, Validators.required],
    studentId:0,
  });

  academicYears:any[]=[]
  private readonly currentDate=new Date();
  private readonly currentYear=new Date().getFullYear();
  minDate = new Date(this.currentYear -40,0,1);
  maxDate=this.currentDate;
  records:Record[]=[];
  studentId:number=0;

  fetchAcademicYears(){
    this.httpClient.get(`${MyConfig.api_address}/MatriculationRecord/GetAllAcaedmicYears`).subscribe((data:any) => {
        console.log(data)
        this.academicYears=data.map((year:any)=>({
          id: year.id,
          name: year.description,
        }));
      }
    )
  }

  fetchRecords(){
    this.httpClient.get<Record[]>(`${MyConfig.api_address}/MatriculationRecord/GetAllRecords/${this.studentId}`).subscribe({
      next:res=>{
        this.records=res;
        console.log(this.records);
      },
      error:err=>{console.log(err)}
    })
  }


  PopulateFeesAndRepeat(year:any){
    const isRepeat=this.records.find(record=>record.godinaStudija==year)?true:false;

    if(!year){
      this.recordForm.patchValue({
        obnovaGodine: false,
        cijenaSkolarine: 0
      })
      return;
    }

    if(isRepeat){
      this.recordForm.patchValue({
        obnovaGodine: true,
        cijenaSkolarine: 400
      })
    }
    else {
      this.recordForm.patchValue({
        obnovaGodine: false,
        cijenaSkolarine: 1800
      })
    }

  }


  EnrollRecord(){
    const enroll={
      ...this.recordForm.getRawValue(),
    }

    enroll.studentId=this.studentId;
    console.log(enroll)

    this.httpClient.post<Record[]>(`${MyConfig.api_address}/MatriculationRecord/AddRecord`,enroll).subscribe({
      next:res=>{
          console.log("Created record");
      },
      error:err=>{console.log(err)}
    })

  }

}
