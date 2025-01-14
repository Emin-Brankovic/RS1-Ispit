import {AfterViewInit, Component, inject, OnInit, ViewChild} from '@angular/core';
import {MatTableDataSource} from '@angular/material/table';
import {
  StudentGetAllEndpointService,
  StudentGetAllResponse
} from '../../../endpoints/student-endpoints/student-get-all-endpoint.service';
import {MatPaginator} from '@angular/material/paginator';
import {MatSort} from '@angular/material/sort';
import {debounceTime, distinctUntilChanged, Subject} from "rxjs";
import {MatDialog} from '@angular/material/dialog';
import {MyDialogConfirmComponent} from '../../shared/dialogs/my-dialog-confirm/my-dialog-confirm.component';
import {HttpClient} from '@angular/common/http';
import {MyConfig} from '../../../my-config';


@Component({
  selector: 'app-students',
  standalone: false,

  templateUrl: './students.component.html',
  styleUrl: './students.component.css'
})
export class StudentsComponent implements OnInit,AfterViewInit{
  ngAfterViewInit(): void {
      this.paginator.page.subscribe(() => {
        const filterValue= this.filter || '';
        this.fetchStudents(filterValue,this.paginator.pageIndex+1,this.paginator.pageSize);
      });
  }
  ngOnInit(): void {
    this.initSearchListener();
    this.fetchStudents();
  }
  displayedColumns: string[] = ['id', 'firstName', 'lastName', 'studentNumber','citizenship','birthMunicipality','actions'];
  datasource:MatTableDataSource<StudentGetAllResponse>=new MatTableDataSource<StudentGetAllResponse>;
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  students:StudentGetAllResponse[]=[];

  private searchSubject: Subject<string> = new Subject();

  private studentCache=new Map<number, StudentGetAllResponse[]>();

  private studentGetAllService=inject(StudentGetAllEndpointService);

  filter:string="";
  showDelete:boolean=true;

  private dialog:MatDialog=new MatDialog();
  httpClient:HttpClient=inject(HttpClient);

  initSearchListener(): void {
    this.searchSubject.pipe(
      debounceTime(300), // Vrijeme čekanja (300ms)
      distinctUntilChanged(), // Emittuje samo ako je vrijednost promijenjena,
    ).subscribe((filterValue) => {
      this.fetchStudents(filterValue, this.paginator.pageIndex + 1, this.paginator.pageSize);
    });
  }

  fetchStudents(filter: string = '', page: number = 1, pageSize: number = 5){
    if(this.studentCache.has(page)){
      this.datasource=new MatTableDataSource<StudentGetAllResponse>(this.studentCache.get(page));
      console.log(this.studentCache);
    }

    else {
      this.studentGetAllService.handleAsync({
        q:filter,
        pageNumber:page,
        pageSize:pageSize,
        deleted:this.showDelete
      }).subscribe({
        next: (data) => {
          this.datasource=new MatTableDataSource<StudentGetAllResponse>(data.dataItems);
          this.studentCache.set(page,data.dataItems);
          this.paginator.length=data.totalCount;
        },
        error: (err) => {
          console.error('Error fetching cities:', err);
        },
      })

    }
  }

    Search(event: Event){
      this.studentCache.clear();
      const filterValue = (event.target as HTMLInputElement).value.trim().toLowerCase();
      this.searchSubject.next(filterValue);
    }

  onShowDeleted() {
    this.studentCache.clear();
    this.fetchStudents(this.filter);
  }

  deleteStudent(studentId:number){
    console.log(`Izbrisani student ${studentId}`)
    this.httpClient.delete(`${MyConfig.api_address}/Student/DeleteStudent/delete/${studentId}`).subscribe(res=>{
      console.log("Izbrisan student");
      this.fetchStudents();
    });

  }

  openConfirmDialog(id:number){
    const dialogRef=this.dialog.open(MyDialogConfirmComponent, {
      width: '350px',
      data:{
        title:"Confirm Deletion",
        message:"Are you sure you want to delete this student ?",
        confirmButtonText:"Yes"
      }
    })

    dialogRef.afterClosed().subscribe(result => {
      if(result){
        console.log('Successful deletion');
        this.deleteStudent(id)
      }
      else{
        console.log('Failed to delete');
      }
    })
  }


}
