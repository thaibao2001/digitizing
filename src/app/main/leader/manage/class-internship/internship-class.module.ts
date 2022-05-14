import { SharedModule } from '../../../../shared/shared.module';
import { NgModule } from '@angular/core';
import 'rxjs/add/operator/takeUntil';
import { RouterModule } from '@angular/router';
import { PermissionGuard } from 'core';
import { ClassInternshipComponent } from './internship-class.component';


@NgModule({
    declarations: [
        ClassInternshipComponent,
    ],
    imports: [
        SharedModule,
        RouterModule.forChild([
            { path: '', component: ClassInternshipComponent, canActivate: [PermissionGuard] },
        ]), // Append position
    ],
  exports: [
    ClassInternshipComponent
  ], // Do not change "// Append position" line above althought only indent
    providers: []
})

export class ClassInternshipModule { }
