import {AfterViewInit, Component, inject, OnInit, ViewChild} from '@angular/core';
import {MatTableDataSource} from "@angular/material/table";
import {
    StudentGetAllEndpointService,
    StudentGetAllResponse
} from "../../../endpoints/student-endpoints/student-get-all-endpoint.service";
import {MyPagedList} from "../../../helper/my-paged-list";
import {MatPaginator} from "@angular/material/paginator";
import {MatSort} from "@angular/material/sort";
import {debounceTime, distinctUntilChanged, Subject} from "rxjs";
import {MyConfig} from "../../../my-config";
import {HttpClient} from "@angular/common/http";
import {MyDialogConfirmComponent} from "../../shared/dialogs/my-dialog-confirm/my-dialog-confirm.component";
import {MatDialog} from "@angular/material/dialog";
import {RegionGetAllResponse} from "../../../endpoints/region-endpoints/region-get-all-endpoint.service";

@Component({
  selector: 'app-students',
  standalone: false,

  templateUrl: './students.component.html',
  styleUrl: './students.component.css'
})
export class StudentsComponent implements OnInit, AfterViewInit {
    private httpClient=inject(HttpClient);
    private dialog=inject(MatDialog);

    ngOnInit(): void {
        this.fetchStudents();

    }

    ngAfterViewInit(): void {
       this.paginator.page.subscribe(page => {
           this.fetchStudents(this.filter,page.pageIndex+1,page.pageSize)
       })

      this.initFilterEvent();

/*      this.sort.sortChange.subscribe((sort) => {
        console.log('Sort changed:', sort);
        console.log(`Active column: ${sort.active}, Direction: ${sort.direction}`);
      });*/
    }

    filter:string="";

    @ViewChild(MatPaginator) paginator!: MatPaginator;
    @ViewChild(MatSort) sort!: MatSort;

    studentGetAllService=inject(StudentGetAllEndpointService)

    dataSource: MatTableDataSource<StudentGetAllResponse> = new MatTableDataSource();
    displayedColumns: string[] = ['id', 'firstName', 'lastName', 'studentNumber', 'citizenship', 'birthMunicipality','actions'];
    students:any[]=[];

    private SearchSubject:Subject<string> = new Subject<string>();
    showDeleted: boolean=true;

    studentCache: Map<number,StudentGetAllResponse[]>=new Map();


    fetchStudents(filter:string='',page:number=1,pageSize:number=5){
        if(this.studentCache.has(page)){
            this.dataSource=new MatTableDataSource<StudentGetAllResponse>(this.studentCache.get(page))
            console.log(this.studentCache);
            this.dataSource.sort = this.sort;
        }
        else {
            this.studentGetAllService.handleAsync({
                q:filter,
                pageSize:pageSize,
                pageNumber:page,
                deleted:this.showDeleted
            }).subscribe({
                next: (data) => {
                    this.dataSource=new MatTableDataSource<StudentGetAllResponse>(data.dataItems)
                    this.paginator.length=data.totalCount
                    this.studentCache.set(page,data.dataItems);
                    //this.dataSource.sort = this.sort;
                }
            })
        }
    }

    SearchStudent(){
        this.studentCache.clear();
        this.SearchSubject.next(this.filter);
    }

    initFilterEvent(){
        this.SearchSubject.pipe(
            debounceTime(300),
            distinctUntilChanged()
        ).subscribe((filterValue) => {
            this.fetchStudents(filterValue, this.paginator.pageIndex + 1, this.paginator.pageSize);
        })
    }

    changeShowDeleted() {
        this.studentCache.clear();
        this.fetchStudents(this.filter);
    }


    openMyConfirmDialog(id: number) {
        const dialogRef = this.dialog.open(MyDialogConfirmComponent, {
            width: '350px',
            data: {
                title: 'Potvrda brisanja',
                message: 'Da li ste sigurni da želite obrisati ovu stavku?'
            }
        });

        dialogRef.afterClosed().subscribe(result => {
            if (result) {
                console.log('Korisnik je potvrdio brisanje');
                // Pozovite servis ili izvršite logiku za brisanje
                this.DeleteStudent(id);
            } else {
                console.log('Korisnik je otkazao brisanje');
            }
        });
    }



    DeleteStudent(studentId:number){
        this.httpClient.delete(`${MyConfig.api_address}/Student/DeleteStudent/${studentId}`).subscribe({
            next: (data) => {
                console.log("Deleted student");
                this.fetchStudents(this.filter);
            }
        })
    }
}
