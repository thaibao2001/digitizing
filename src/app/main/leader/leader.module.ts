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
                loadChildren: () => import('./view-teacher/view-teacher.module').then(m => m.ViewTeacherModule),
                data: {
                    full_path: 'leader/view-teacher',
                    preload: true,
                    delay: true
                }
            }, 
            {
                path: 'view-class',
                loadChildren: () => import('./view-class/view-class.module').then(m => m.ViewClassModule),
                data: {
                    full_path: 'leader/view-class',
                    preload: true,
                    delay: true
                }
            }, 
            {
                path: 'view-subject',
                loadChildren: () => import('./view-subject/view-subject.module').then(m => m.ViewSubjectModule),
                data: {
                    full_path: 'leader/view-subject',
                    preload: true,
                    delay: true
                }
            }, 
        ]), // Append position
    ],
    exports: [], // Do not change "// Append position" line above althought only indent
    providers: []
})

export class LeaderModule { }
