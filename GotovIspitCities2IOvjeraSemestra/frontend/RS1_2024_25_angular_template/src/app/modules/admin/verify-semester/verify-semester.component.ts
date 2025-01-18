import {Component, inject, OnInit} from '@angular/core';
import {FormBuilder, Validators} from '@angular/forms';
import {ActivatedRoute} from '@angular/router';
import {HttpClient} from '@angular/common/http';



export interface VerifySemesterRequest {
  yearId?: number;
  verifyDate?: Date;
  remark?: string;
}




@Component({
  selector: 'app-verify-semester',
  standalone: false,

  templateUrl: './verify-semester.component.html',
  styleUrl: './verify-semester.component.css'
})
export class VerifySemesterComponent implements OnInit {


  ngOnInit(): void {
     this.verifyYearId=this.route.snapshot.params['id'];
  }

  fb=inject(FormBuilder);
  route=inject(ActivatedRoute);
  httpClient: HttpClient=inject(HttpClient);
  private  readonly _currentDate=new Date();
  private readonly  _currentYear=new Date().getFullYear();
  verifyYearId:number=0

  verifySemesterForm=this.fb.group({
    verifyDate:[this._currentDate, Validators.required],
    remark:['', Validators.required],
    yearId:[0, Validators.required],
  });

  minDate=new Date(this._currentYear -40,0,1);
  maxDate= true
    ?this._currentDate : new Date(this._currentYear +1,11,31)



  VerifySemester(){
    const yearVerify={... this.verifySemesterForm.value}

    yearVerify.yearId=this.verifyYearId;

    console.log(yearVerify);

    this.httpClient.put<VerifySemesterRequest>(`http://localhost:7000/MatriculationRecord/VerifySemester/${this.verifyYearId}`,yearVerify).subscribe({
        next: (data) => {
          console.log(data)
        }
    })

  }

}
