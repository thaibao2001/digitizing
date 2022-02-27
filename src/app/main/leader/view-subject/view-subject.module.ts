import { SharedModule } from '../../../shared/shared.module';
import { NgModule } from '@angular/core';
import 'rxjs/add/operator/takeUntil';
import { RouterModule } from '@angular/router';
import { PermissionGuard } from 'core';
import { ViewSubjectComponent } from './view-subject.component';
import { TabViewModule } from 'primeng/tabview';

@NgModule({
    declarations: [
        ViewSubjectComponent,
    ],
    imports: [
        SharedModule,
        TabViewModule,
        RouterModule.forChild([
            { path: '', component: ViewSubjectComponent, canActivate: [PermissionGuard] },
        ]), // Append position
    ],
    exports: [], // Do not change "// Append position" line above althought only indent
    providers: []
})

export class ViewSubjectModule { }
