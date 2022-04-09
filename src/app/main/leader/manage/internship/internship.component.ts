import {
  Component,
  Injector,
  OnInit,
  ChangeDetectionStrategy,
  ViewChild,
} from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import {
  ENotificationType,
  Grid,
  SystemConstants,
  CustomizeFileUpload,
  CustomEmailValidator,
} from 'core';
import { combineLatest, Observable } from 'rxjs';
import 'rxjs/add/observable/combineLatest';
import 'rxjs/add/operator/takeUntil';
import { Internship } from '../../entities/internship';
declare var $: any;

@Component({
  selector: 'app-internship',
  templateUrl: './internship.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InternshipComponent extends Grid implements OnInit {
  public host_image: any;
  public isCreate = false;
  public internship: Internship;
  public years = [];
  public selectedYear = '';

  public constructor(injector: Injector) {
    super(injector);
    this.LZCompress = true; // using LZString compress data
    this.loadBalancing = true;
    this.host_image = SystemConstants.IMAGE_API + '/';
    this.APIModuleName = 'LEAD';
    // this.getListByIdApiUrl = '/api/internship/get-list-by-id/';
    this.searchApiUrl = '/api/leader-internship/search';
    this.exportUrl = '/api/leader-internship/export-to-excel';
    this.exportFilename = 'list_website_info_ref.xlsx';
    this.setNullIfEmpty = [];
    this.filterFields = [
      'web_info_rcd',
      'web_info_faculty',
      'web_info_address',
      'web_info_email',
      'web_info_phone',
      'sort_order',
    ];
    this.dataKey = 'internship_id_rcd';
    this.searchValue.page = this.page;
    this.searchValue.pageSize = this.pageSize;
    this.searchFormGroup = new FormGroup({
      academic_year: new FormControl(''),
      yearSelect: new FormControl(''),
    });
    this.hasViewPermission = this._authenService.hasPermission(
      this.pageId,
      'view_website_info_ref'
    );
    this.hasCreatePermission = this._authenService.hasPermission(
      this.pageId,
      'create_website_info_ref'
    );
    this.hasUpdatePermission = this._authenService.hasPermission(
      this.pageId,
      'update_website_info_ref'
    );
    this.hasDeletePermission = this._authenService.hasPermission(
      this.pageId,
      'delete_website_info_ref'
    );
    this.tableActions = [];
    if (this.hasDeletePermission) {
      this._translateService.get('COMMON.delete').subscribe((message) => {
        this.tableActions.push({
          label: message,
          icon: 'fa-close',
          command: () => {
            this.onRemove(this.selectedDataTableItems);
          },
        });
      });
    }
    this.predicateAfterSearch = () => {
      this._changeDetectorRef.detectChanges();
    };
  }

  public loadDropdowns() {
    this.search();
  }

  public ngOnInit() {
    this.internship = new Internship();
    this.loadDropdowns();
    for (let i = 2015; i < 2022; i++) {
      this.years = [...this.years, { id: i, label: i + '-' + (i + 1) }];
    }
  }

  public handleChangeYear(e) {
    this.selectedYear = e;
  }

  public viewClick(e) {
    e.stopPropagation();
  }

  public openCreateModal(row: any = null) {
    this.doneSetupForm = false;
    this.showUpdateModal = true;
    setTimeout(() => {
      $('#updateInternshipModal').appendTo('body').modal('toggle');
    });
    setTimeout(() => {
      this.internship = new Internship();
      this.isCreate = true;
      this.updateForm = new FormGroup({
        internship_id_rcd: new FormControl('', [
          Validators.required,
          Validators.maxLength(10),
        ]),
        academic_year: new FormControl('', [
          Validators.required,
          Validators.maxLength(50),
        ]),
        semester: new FormControl('', [
          Validators.required,
          Validators.pattern('[1-2]'),
          Validators.max(2),
          Validators.min(1),
        ]),
      });
      this.updateFormOriginalData = this.updateForm.getRawValue();
      this.doneSetupForm = true;
      setTimeout(() => {
        this._changeDetectorRef.detectChanges();
        this.setAutoFocus();
        this.updateValidator();
      });
    }, 300);
  }

  public updateValidator() {
    this.updateForm.valueChanges.subscribe((res) => {
      this.enabledSubmitFlag = this.modified();
    });
  }

  public onSubmit() {
    if (this.submitting == false) {
      this.submitting = true;
      console.log(this.internship);
      if (this.isCreate) {
        this._apiService
          .post('/api/adapter/execute', {
            Method: { Method: 'POST' },
            Url: '/api/leader-internship/create-leader-internship',
            Module: 'LEAD',
            Data: JSON.stringify(this.internship),
          })
          .subscribe(
            (res) => {
              let item = this.copyProperty(res.data);
              let idx;
              if (this.data.length >= this.pageSize) {
                this.data.splice(this.data.length - 1, 1);
              }
              this.data.unshift(item);
              this.data = this.data.slice();
              this.totalRecords += 1;
              this.internship = new Internship();
              this.resetUpdateForm();
              this.closeUpdateForm(null);
              this._functionConstants.ShowNotification(
                ENotificationType.GREEN,
                res.messageCode
              );
              this.submitting = false;
            },
            (error) => {
              this.submitting = false;
            }
          );
      } else {
        this._apiService
          .post('/api/adapter/execute', {
            Method: { Method: 'POST' },
            Url: '/api/leader-internship/update-leader-internship',
            Module: 'LEAD',
            Data: JSON.stringify(this.internship),
          })
          .subscribe(
            (res) => {
              let index = this.data.findIndex(
                (ds) => ds[this.dataKey] == this.internship[this.dataKey]
              );
              let item = this.copyProperty(res.data);
              let idx;
              this.data[index] = item;
              this.data = this.data.slice();
              this.closeUpdateForm(null);
              this._functionConstants.ShowNotification(
                ENotificationType.GREEN,
                res.messageCode
              );
              this.submitting = false;
            },
            (error) => {
              this.submitting = false;
            }
          );
      }
    }
  }

  public onRemove(items: any[]) {
    if (items.length > 0) {
      this._translateService
        .get('MESSAGE.confirm_delete')
        .subscribe((message) => {
          this._confirmationService.confirm({
            message: message,
            accept: () => {
              let removeIds = [];
              items.forEach((ds) => {
                if (!ds.must_not_change_flag) {
                  removeIds.push(ds.internship_id_rcd);
                }
              });
              if (removeIds.length > 0) {
                this._apiService
                  .post('/api/adapter/execute', {
                    Method: { Method: 'POST' },
                    Url: '/api/leader-internship/delete-leader-internship',
                    Module: 'LEAD',
                    Data: JSON.stringify(removeIds),
                  })
                  .subscribe((res) => {
                    this.search();
                    this.selectedDataTableItems = [];
                    this._functionConstants.ShowNotification(
                      ENotificationType.GREEN,
                      res.messageCode
                    );
                  });
              }
            },
          });
        });
    }
  }

  public openUpdateModal(row) {
    this.doneSetupForm = false;
    this.showUpdateModal = true;
    setTimeout(() => {
      $('#updateInternshipModal').appendTo('body').modal('toggle');
    });
    setTimeout(() => {
      let arrRequest = this.getArrayRequest();
      arrRequest.push(
        this._apiService.post('/api/adapter/execute', {
          Method: { Method: 'GET' },
          Url: '/api/leader-internship/get-by-id/' + row.internship_id_rcd,
          Module: 'LEAD',
        })
      );
      Observable.combineLatest(arrRequest).subscribe((res: any) => {
        this.isCreate = false;
        this.internship = res[0].data;
        this.updateForm = new FormGroup({
          internship_id_rcd: new FormControl(
            { value: this.internship.internship_id_rcd, disabled: true },
            [Validators.required, Validators.maxLength(10)]
          ),
          academic_year: new FormControl(this.internship.academic_year, [
            Validators.required,
            Validators.maxLength(50),
          ]),
          semester: new FormControl(this.internship.semester, [
            Validators.required,
            Validators.pattern('[1-2]'),
            Validators.max(2),
            Validators.min(1),
          ]),
        });
        this.updateFormOriginalData = this.updateForm.getRawValue();
        this.doneSetupForm = true;
        setTimeout(() => {
          this._changeDetectorRef.detectChanges();
          this.setAutoFocus();
          this.updateValidator();
        });
      });
    }, 300);
  }

  public getArrayRequest() {
    let arrRequest = [];
    return arrRequest;
  }
}
