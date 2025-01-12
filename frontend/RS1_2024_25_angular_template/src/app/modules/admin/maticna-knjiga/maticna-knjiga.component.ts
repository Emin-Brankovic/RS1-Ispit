import {Component, inject, OnInit} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {HttpClient} from '@angular/common/http';
import {MyConfig} from '../../../my-config';

@Component({
  selector: 'app-maticna-knjiga',
  standalone: false,

  templateUrl: './maticna-knjiga.component.html',
  styleUrl: './maticna-knjiga.component.css'
})
export class MaticnaKnjigaComponent implements OnInit {
  ngOnInit(): void {
      this.studentId=this.route.snapshot.params['id'];
      this.fetchStudent();
  }
  route=inject(ActivatedRoute);
  httpClient=inject(HttpClient);
  studentId:number=0;
  student:any={}

  fetchStudent(){
    this.httpClient.get(`${MyConfig.api_address}/Student/GetStudentById/${this.studentId}`).subscribe({
      next:res=>{this.student=res;}
    })
  }


}
