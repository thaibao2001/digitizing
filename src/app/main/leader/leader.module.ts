import { SharedModule } from './../../shared/shared.module';
import { NgModule } from '@angular/core';
import 'rxjs/add/operator/takeUntil';
import { RouterModule } from '@angular/router';

@NgModule({
  declarations: [],
  imports: [
    SharedModule,
    RouterModule.forChild([
      {
        path: 'view-teacher',
        loadChildren: () =>
          import('./manage/view-teacher/view-teacher.module').then(
            (m) => m.ViewTeacherModule
          ),
        data: {
          full_path: 'leader/view-teacher',
          preload: true,
          delay: true,
        },
      },
      {
        path: 'view-class',
        loadChildren: () =>
          import('./manage/view-class/view-class.module').then(
            (m) => m.ViewClassModule
          ),
        data: {
          full_path: 'leader/view-class',
          preload: true,
          delay: true,
        },
      },
      {
        path: 'view-subject',
        loadChildren: () =>
          import('./manage/view-subject/view-subject.module').then(
            (m) => m.ViewSubjectModule
          ),
        data: {
          full_path: 'leader/view-subject',
          preload: true,
          delay: true,
        },
      },
      {
        path: 'education-curriculum',
        loadChildren: () =>
          import(
            './manage/education-curriculum/education-curriculum.module'
          ).then((m) => m.EducationCurriculumModule),
        data: {
          full_path: 'leader/education-curriculum',
          preload: true,
          delay: true,
        },
      },
      {
        path: 'course',
        loadChildren: () =>
          import('./manage/course/course.module').then((m) => m.CourseModule),
        data: {
          full_path: 'leader/course',
          preload: true,
          delay: true,
        },
      },
      {
        path: 'assignment-internship',
        loadChildren: () =>
          import(
            './manage/assignment-internship/assignment-internship.module'
          ).then((m) => m.AssignmentInternshipModule),
        data: {
          full_path: 'leader/assignment-internship',
          preload: true,
          delay: true,
        },
      },
      {
        path: 'internship',
        loadChildren: () =>
          import('./manage/internship/internship.module').then(
            (m) => m.InternshipModule
          ),
        data: {
          full_path: 'leader/internship',
          preload: true,
          delay: true,
        },
      },
      {
        path: 'internship-class',
        loadChildren: () =>
          import('./manage/class-internship/internship-class.module').then(
            (m) => m.ClassInternshipModule
          ),
        data: {
          full_path: 'leader/internship-class',
          preload: true,
          delay: true,
        },
      },
    ]), // Append position
  ],
  exports: [], // Do not change "// Append position" line above althought only indent
  providers: [],
})
export class LeaderModule {}
