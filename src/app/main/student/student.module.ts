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
                path: 'ly-lich',
                loadChildren: () => import('./ly-lich/website-tag.module').then(m => m.LyLichgModule),
                data: {
                    full_path: 'student/ly-lich',
                    preload: true, delay: true
                }
            }, 
        ]), // Append position
    ],
    exports: [], // Do not change "// Append position" line above althought only indent
    providers: []
})

export class StudentModule { }
