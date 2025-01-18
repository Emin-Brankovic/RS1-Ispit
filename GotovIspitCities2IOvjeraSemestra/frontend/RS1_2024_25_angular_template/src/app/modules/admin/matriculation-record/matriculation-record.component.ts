import {Component, inject, OnInit} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {MyConfig} from '../../../my-config';
import {ActivatedRoute, Router} from '@angular/router';
import {MatTableDataSource} from '@angular/material/table';


export interface Record{
  id: number;

  datum2ZimskiOvjera?: Date | null;

  datum1ZimskiUpis?: Date | null;

  godinaStudija: number;

  studentId: number;

  akademskaGodinaId: number;

  cijenaSkolarine?: number | null;

  obnovaGodine: boolean;

  napomena?: string | null;
}


// @ts-ignore
@Component({
  selector: 'app-matriculation-record',
  standalone: false,

  templateUrl: './matriculation-record.component.html',
  styleUrl: './matriculation-record.component.css'
})
export class MatriculationRecordComponent implements OnInit{
  ngOnInit(): void {
    this.studentId=this.route.snapshot.params['id'];

    this.fetchStudent();
    this.fetchRecords();

  }


  httpClient: HttpClient=inject(HttpClient);
  route=inject(ActivatedRoute);
  router=inject(Router);
  student:any={};
  studentId:number=0;
  records:Record[]=[];

  displayedColumns:string[]=['id','academicYear','yearOfStudy','renewal','winterSemester','actions']
  dataSource: MatTableDataSource<Record>=new MatTableDataSource<Record>();


  fetchStudent(){
    this.httpClient.get(`${MyConfig.api_address}/Student/getStudentForMatriculationRecord/matriculation/studentID/${this.studentId}`).subscribe({
      next:res=>{
        this.student=res;
        this.student={...res};
        console.log(this.student)
      },
      error:err=>{console.log(err)}
    })
  }

  fetchRecords(){
    this.httpClient.get<Record[]>(`${MyConfig.api_address}/MatriculationRecord/GetAllRecords/${this.studentId}`).subscribe({
      next:res=>{
        this.records=res;
        this.dataSource=new MatTableDataSource<Record>(this.records);
        //console.log(this.records);
        console.log(this.dataSource.data);
      },
      error:err=>{console.log(err)}
    })
  }



  CreatMatricaltionRecord() {
    /*    this.router.navigateByUrl(`/create-matriculation-record/${this.studentId}`);*/

    this.router.navigate(['/admin/students/create-matriculation-record/',this.studentId]);
  }
}
