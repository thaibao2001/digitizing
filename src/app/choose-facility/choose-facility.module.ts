import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { ApiService, AuthenService, LoginGuard } from 'core';
import 'rxjs/add/operator/takeUntil';
import { SharedModule } from '../shared/shared.module';
import { ChooseFacilityComponent } from './choose-facility.component';


const routing: Routes = [
    { path: '', component: ChooseFacilityComponent }
];

@NgModule({
    imports: [
        CommonModule,
        SharedModule,
        FormsModule,
        RouterModule.forChild(routing),
    ],
    declarations: [
        ChooseFacilityComponent,
    ],
    exports: [],
    providers: [
        ApiService,
        LoginGuard,
        AuthenService
    ]
})

export class ChooseFacilityModule { }
