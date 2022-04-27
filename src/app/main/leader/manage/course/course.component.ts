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
import { Course } from '../../entities/course';
declare var $: any;

@Component({
  selector: 'app-course',
  templateUrl: './course.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CourseComponent extends Grid implements OnInit {
  public host_image: any;
  public isCreate = false;
  public course: Course;
  public typeCourses = [];

  @ViewChild(CustomizeFileUpload, { static: false })
  fu_web_info_logo_l: CustomizeFileUpload;
  @ViewChild(CustomizeFileUpload, { static: false })
  fu_web_info_logo_e: CustomizeFileUpload;

  public constructor(injector: Injector) {
    super(injector);
    this.LZCompress = true; // using LZString compress data
    this.loadBalancing = true;
    this.host_image = SystemConstants.IMAGE_API + '/';
    this.APIModuleName = 'LEAD';
    this.getListByIdApiUrl = '/api/course/get-list-by-id/';
    this.searchApiUrl = '/api/course/search';
    this.exportUrl = '/api/course/export-to-excel';
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
    this.dataKey = 'course_id_rcd';
    this.searchValue.page = this.page;
    this.searchValue.pageSize = this.pageSize;
    this.searchFormGroup = new FormGroup({
      course_name: new FormControl(''),
      course_type: new FormControl(''),
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
    this.course = new Course();
    this.loadDropdowns();
    this.typeCourses = [
      {
        label: 'Đại cương',
        value: 'DC'
      },
      {
        label: 'Cơ sở ngành',
        value: 'CSN'
      },
      {
        label: 'Chuyên ngành',
        value: 'CN'
      },
      {
        label: 'Đồ án thực tập',
        value: 'DATT'
      },
      {
        label: 'Đồ án chuyên ngành',
        value: 'DACN'
      },
    ]
    
  }

  public openCreateModal(row: any = null) {
    this.doneSetupForm = false;
    this.showUpdateModal = true;
    setTimeout(() => {
      $('#updateCourseModal').appendTo('body').modal('toggle');
    });
    setTimeout(() => {
      this.course = new Course();
      this.isCreate = true;
      this.updateForm = new FormGroup({
        course_id_rcd: new FormControl('', [
          Validators.required,
          Validators.maxLength(10),
        ]),
        course_name: new FormControl('', [
          Validators.required,
          Validators.maxLength(100),
        ]),
        course_type: new FormControl('', [
          Validators.required,
          Validators.maxLength(5),
        ]),
        num_credits1: new FormControl('', [Validators.required, Validators.pattern('^[0-9]{1}$')]),
        num_credits2: new FormControl('', [Validators.required, Validators.pattern('^[0-9]{1}$')]),
        comment: new FormControl('', []),
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
      console.log(this.course);
      if (this.isCreate) {
        this._apiService
          .post('/api/adapter/execute', {
            Method: { Method: 'POST' },
            Url: '/api/course/create-course',
            Module: 'LEAD',
            Data: JSON.stringify(this.course),
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
              this.course = new Course();
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
      }
      else {
        this._apiService
          .post('/api/adapter/execute', {
            Method: { Method: 'POST' },
            Url: '/api/course/update-course',
            Module: 'LEAD',
            Data: JSON.stringify(this.course),
          })
          .subscribe(
            (res) => {
              let index = this.data.findIndex(
                (ds) => ds[this.dataKey] == this.course[this.dataKey]
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
      this._translateService.get('MESSAGE.confirm_delete').subscribe((message) => {
        this._confirmationService.confirm({
          message: message,
          accept: () => {
            let removeIds = [];
            items.forEach(ds => {
              if (!ds.must_not_change_flag) {
                removeIds.push(ds.course_id_rcd);
              }
            });
            if (removeIds.length > 0) {
              this._apiService.post('/api/adapter/execute', { Method: { Method: 'POST' }, Url: '/api/course/delete-course', Module: 'LEAD', Data: JSON.stringify(removeIds) }).subscribe(res => {
                this.search();
                this.selectedDataTableItems = [];
                this._functionConstants.ShowNotification(ENotificationType.GREEN, res.messageCode);
              });
            }
          }
        });
      });
    }
  }

  public openUpdateModal(row) {
    this.doneSetupForm = false;
    this.showUpdateModal = true;
    setTimeout(() => {
      $('#updateCourseModal').appendTo('body').modal('toggle');
    });
    setTimeout(() => {
      let arrRequest = this.getArrayRequest();
      arrRequest.push(
        this._apiService.post('/api/adapter/execute', {
          Method: { Method: 'GET' },
          Url: '/api/course/get-by-id/' + row.course_id_rcd,
          Module: 'LEAD',
        })
      );
      Observable.combineLatest(arrRequest).subscribe((res: any) => {
        this.isCreate = false;
        this.course = res[0].data;
        this.updateForm = new FormGroup({
          course_id_rcd: new FormControl(
            { value: this.course.course_id_rcd, disabled: true },
            [Validators.required, Validators.maxLength(10)]
          ),
          course_name: new FormControl(this.course.course_name, [
            Validators.required,
            Validators.maxLength(100),
          ]),
          course_type: new FormControl(this.course.course_type, [
            Validators.required,
            Validators.maxLength(5),
          ]),
          num_credits1: new FormControl(this.course.num_credits1, [
            Validators.required, Validators.pattern('^[0-9]{1}$')
          ]),
          num_credits2: new FormControl(this.course.num_credits2, [
            Validators.required, Validators.pattern('^[0-9]{1}$')
          ]),
          comment: new FormControl(this.course.comment, []),
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
