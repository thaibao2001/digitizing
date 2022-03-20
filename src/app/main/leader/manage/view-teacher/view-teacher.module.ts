import { SharedModule } from './../../../../shared/shared.module';
import { NgModule } from '@angular/core';
import 'rxjs/add/operator/takeUntil';
import { RouterModule } from '@angular/router';
import { PermissionGuard } from 'core';
import { ViewTeacherComponent } from './view-teacher.component';
import { TabViewModule } from 'primeng/tabview';

@NgModule({
    declarations: [
        ViewTeacherComponent,
    ],
    imports: [
        SharedModule,
        TabViewModule,
        RouterModule.forChild([
            { path: '', component: ViewTeacherComponent, canActivate: [PermissionGuard] },
        ]), // Append position
    ],
    exports: [], // Do not change "// Append position" line above althought only indent
    providers: []
})

export class ViewTeacherModule { }
