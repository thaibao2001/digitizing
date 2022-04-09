import { Component, Injector, OnInit, ChangeDetectionStrategy, ViewChild } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ENotificationType, Grid, SystemConstants, CustomizeFileUpload } from 'core';
import { Observable } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import * as FileSaver from 'file-saver';
import 'rxjs/add/observable/combineLatest';
import 'rxjs/add/operator/takeUntil';
import { WebsiteTag } from '../../../entities/website-tag';
declare var $: any;

@Component({
  selector: 'app-view-teacher',
  templateUrl: './view-teacher.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ViewTeacherComponent extends Grid implements OnInit {

  public isCreate = false;

  public website_tag: WebsiteTag;

  public constructor(injector: Injector) {
    super(injector);
    this.LZCompress = true; // using LZString compress data
    this.loadBalancing = true;
    this.APIModuleName = 'LEAD';
    this.getListByIdApiUrl = '/api/website-tag/get-list-by-id/';
    this.searchApiUrl = '/api/teacher/search-teacher';
    this.exportUrl = '/api/website-tag/export-to-excel';
    this.exportFilename = 'list_website_tag.xlsx';
    this.setNullIfEmpty = [];
    this.filterFields = ['tag_name', 'sort_order'];
    this.dataKey = 'tag_id';
    this.searchValue.page = this.page;
    this.searchValue.pageSize = this.pageSize;
    this.searchFormGroup = new FormGroup({
      'teacher_name': new FormControl(''),
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
    setTimeout(() => console.log(this.data), 3000);
  }

  public getArrayRequest() {
    let arrRequest = [];
    return arrRequest;
  }
}
