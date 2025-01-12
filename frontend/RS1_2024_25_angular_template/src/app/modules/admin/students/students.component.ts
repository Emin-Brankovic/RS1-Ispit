import {AfterViewInit, Component, OnInit, ViewChild} from '@angular/core';
import {Router} from '@angular/router';
import {
  StudentGetAllEndpointService,
  StudentGetAllResponse
} from '../../../endpoints/student-endpoints/student-get-all-endpoint.service';
import {MatTableDataSource} from '@angular/material/table';
import {CityGetAll3Response} from '../../../endpoints/city-endpoints/city-get-all3-endpoint.service';
import {MatPaginator} from '@angular/material/paginator';
import {MatSort} from '@angular/material/sort';
import {debounceTime, distinctUntilChanged, Subject, takeUntil} from 'rxjs';
import {MyPagedList} from '../../../helper/my-paged-list';
import {HttpClient} from '@angular/common/http';
import {MyConfig} from '../../../my-config';

@Component({
  selector: 'app-students',
  standalone: false,

  templateUrl: './students.component.html',
  styleUrl: './students.component.css'
})
export class StudentsComponent implements OnInit,AfterViewInit {


  datasource:MatTableDataSource<StudentGetAllResponse> = new MatTableDataSource<StudentGetAllResponse>();
  students:StudentGetAllResponse[] = []
  filteredStudents:StudentGetAllResponse[]=[]
  displayedColumns: string[] = ['firstName','lastName', 'studentNumber','citizenship','birthMunicipality', 'actions'];
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  private searchSubject: Subject<string> = new Subject();
  studentCache:Map<number,StudentGetAllResponse[]>=new Map();
  showDeleted: boolean=true;

  constructor(private router: Router,private studentGetAll:StudentGetAllEndpointService,private httpCline:HttpClient) {
  }

  ngOnInit(): void {
        this.initSearchListener()
        this.fetchStudents();
    }

    initSearchListener(): void {
      this.searchSubject.pipe(
        debounceTime(300),
        distinctUntilChanged()
      ).subscribe((filterValue) => {
        this.fetchStudents(filterValue, this.paginator.pageIndex + 1, this.paginator.pageSize);
      })
    }

    applyFilter(event:Event): void {
      const filterValue = (event.target as HTMLInputElement).value.trim().toLowerCase();
      console.log("Cache nakon novog filtera");
      this.searchSubject.next(filterValue);

    }

    ngAfterViewInit(): void {

      this.paginator.page.subscribe(()=>{
        const filterValue = this.datasource.filter || '';
        this.fetchStudents(filterValue,this.paginator.pageIndex+1,this.paginator.pageSize);
      });
    }

    fetchStudents(filter: string = '', page: number = 1, pageSize: number = 5){
      this.studentGetAll.handleAsync({
        q:filter,
        pageSize:pageSize,
        pageNumber:page,
        isObrisan:!this.showDeleted
      }).subscribe({
          next: (data) => {
              this.datasource=new MatTableDataSource<StudentGetAllResponse>(data.dataItems);
              this.paginator.length=data.totalCount;
              this.students=data.dataItems;
          },
          error: (err) => {console.error('Error fetching students:', err);}
        }
      )
    }

  DeleteStudent(studentId:number) {
    this.httpCline.put(`${MyConfig.api_address}/student/deletestudent`,{Id:studentId}).subscribe({
      next:res=>{
        console.log(res);
        this.fetchStudents();
      },
      error:err => console.error('Error fetching student:', err)
    })
  }

/*  HideDeleted(){
    console.log(this.showDeleted);
    if(this.showDeleted){
      this.filteredStudents=this.students.filter((item:any)=>{return item.obrisan==!this.showDeleted;});
      this.datasource=new MatTableDataSource<StudentGetAllResponse>(this.filteredStudents);
    }
    else{
      this.fetchStudents();
    }


  }*/
}
