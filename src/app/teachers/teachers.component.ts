import { Component, Input, OnInit, TemplateRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';

import { Discipline } from '../models/discipline';
import { Teacher } from '../models/teacher';
import { TeacherService } from '../services/teacher.service';

import { forceWait } from 'src/util/time-util';

@Component({
  selector: 'app-teachers',
  templateUrl: './teachers.component.html',
  styleUrls: ['./teachers.component.css']
})
export class TeacherComponent implements OnInit {
  public title = 'Professores';
  public newTeacher = false;
  public showLoading = false;

  public teacherSelected: Teacher;
  public teachers: Array<Teacher>;
  public teacherForm: FormGroup;
  public modalRef?: BsModalRef;

  @Input() showActions = true;


  constructor(private formBuilder: FormBuilder, private modalService: BsModalService, private teacherService: TeacherService) {
    this.createForm();
  }

  ngOnInit(): void {
    this.loadTeachers();
  }

  private async loadTeachers() {
    try {
      this.showLoading = true

      await forceWait(750);
      this.teachers = await this.teacherService.getAll().toPromise();

      this.showLoading = false
    } catch (error) {
      console.log(error);
    }
  }

  private createForm() {
    this.teacherForm = this.formBuilder.group({
      id: [''],
      name: ['', Validators.required],
      disciplines: ['', Validators.required],
    });
  }

  public submit() {
    const action = this.newTeacher ? 'save' : 'update';
    const teacher =  this.teacherForm.value as Teacher;
    const discipline = new Discipline(this.teacherForm.value.disciplines)
    teacher.disciplines = [discipline]

    this.teacherService[action](teacher).subscribe(
      () => {
        this.loadTeachers();
      },
      (error) => {
        console.log(error);
      }
    );
  }

  public deleteTeacher(id: number) {
    this.teacherService.delete(id).subscribe(
      () => {
        this.loadTeachers();
      },
      (error) => {
        console.log(error);
      }
    );
  }

  public teacherSelect = (teacher: Teacher) => {
    this.teacherSelected = teacher;
    this.teacherForm.patchValue(teacher);
    this.newTeacher = false;
  }

  public close = () => {
    this.teacherSelected = null;
    this.newTeacher = false;
  }

  public openModal(template: TemplateRef<any>) {
    this.modalRef = this.modalService.show(template);
  }

  public handleNewTeacher = () => {
    this.teacherForm.reset();
    this.teacherSelected = new Teacher();
    this.teacherForm.patchValue(this.teacherSelected);
    this.newTeacher = true;
  }
}
