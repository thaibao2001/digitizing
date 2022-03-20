import { Component, Injector, OnInit, ChangeDetectionStrategy, ViewChild } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ENotificationType, Grid, SystemConstants, CustomizeFileUpload } from 'core';
import { Observable } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import * as FileSaver from 'file-saver';
import 'rxjs/add/observable/combineLatest';
import 'rxjs/add/operator/takeUntil';
import { WebsiteTag } from '../../../entities/website-tag';
import { FilterUtils } from 'primeng/api';
declare var $: any;

@Component({
  selector: 'app-view-class',
  templateUrl: './view-class.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ViewClassComponent extends Grid implements OnInit {

  public isCreate = false;

  public website_tag: WebsiteTag;

  public majors: any ;

  public specializations: any;

  public rootData: any;
  public selectedMajor: any;
  public selectedSpecialization: any;

  public constructor(injector: Injector) {
    super(injector);
    this.LZCompress = true; // using LZString compress data
    this.loadBalancing = true;
    this.APIModuleName = 'LEAD';
    this.getListByIdApiUrl = '/api/website-tag/get-list-by-id/';
    this.searchApiUrl = '/api/class/search-classes';
    this.exportUrl = '/api/website-tag/export-to-excel';
    this.exportFilename = 'list_website_tag.xlsx';
    this.setNullIfEmpty = [];
    this.filterFields = ['tag_name', 'sort_order'];
    this.dataKey = 'tag_id';
    this.searchValue.page = this.page;
    this.searchValue.pageSize = this.pageSize;
    this.searchFormGroup = new FormGroup({
      'class_name': new FormControl(''),
    });
    this.hasViewPermission = this._authenService.hasPermission(this.pageId, 'view_website_tag');
    this.hasCreatePermission = this._authenService.hasPermission(this.pageId, 'create_website_tag');
    this.hasUpdatePermission = this._authenService.hasPermission(this.pageId, 'update_website_tag');
    this.hasDeletePermission = this._authenService.hasPermission(this.pageId, 'delete_website_tag');
    this.tableActions = [];
    if (this.hasDeletePermission) {
      // this._translateService.get('COMMON.delete').subscribe((message) => {
      //   this.tableActions.push({ label: message, icon: 'fa-close', command: () => { this.onRemove(this.selectedDataTableItems); } });
      // });
    }
    this.predicateAfterSearch = () => {
      this._changeDetectorRef.detectChanges();
    };
  }

  public loadDropdowns() {
    this.search();
  }

  public ngOnInit() {
    this.website_tag = new WebsiteTag();
    this.loadDropdowns();
    
    this.majors = [{ id: 1, name: 'Tất cả'}];
    this.specializations = [{ id: 1, name: 'Tất cả'}];
    this.selectedMajor = this.majors[0];
    this.selectedSpecialization = this.specializations[0];
    setTimeout(() => {
      let i = 2, j = 2;
      this.rootData = this.data;

      this.data.forEach(item => {
        if (!this.majors.find(major => major.name == item.major_name)) {
          this.majors = [...this.majors, { id: i, name: item.major_name }];
          i++;
        }
        if (!this.specializations.find(special => special.name == item.specialization_name)) {
          this.specializations = [...this.specializations, { id: j, name: item.specialization_name }];
          j++;
        }
      });
    }, 1000);
  }

  public changeMajor(e) {
    this.filterData();
  }

  public changeSpecialization(e) {
    this.filterData();
  }

  public filterData() {
    const filtered = [];
    if ((this.selectedSpecialization.id === 1 || !this.selectedSpecialization) && (this.selectedMajor.id === 1 || !this.selectedMajor)) {
      this.data = this.rootData;
      return;
    }
    else if((this.selectedSpecialization.id === 1 || !this.selectedSpecialization) && this.selectedMajor.id !== 1) {
      this.rootData.forEach(item => {
        if (this.selectedMajor.name === item.major_name)
          filtered.push(item);
      });
    }
    else if(this.selectedSpecialization.id !== 1 && (this.selectedMajor.id === 1 || !this.selectedMajor)) {
      this.rootData.forEach(item => {
        if (this.selectedSpecialization.name === item.specialization_name)
          filtered.push(item);
      });
    }
    else {
      this.rootData.forEach(item => {
        if (this.selectedSpecialization.name === item.specialization_name && this.selectedMajor.name === item.major_name)
          filtered.push(item);
      });
    }
    this.data = filtered;
  }

  public getArrayRequest() {
    let arrRequest = [];
    return arrRequest;
  }
}
