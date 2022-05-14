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
  CustomEmailValidator, Guid,
} from 'core';
import { combineLatest, Observable } from 'rxjs';
import 'rxjs/add/observable/combineLatest';
import 'rxjs/add/operator/takeUntil';
import {Internship, InternshipClassModel} from '../../entities/internship';
import {DynamicDialogModule} from 'primeng/dynamicdialog';
import {DialogService, TreeNode} from 'primeng/api';
import {UITreeNode} from 'primeng/primeng';
import {AssignmentInternshipComponent} from '../assignment-internship/assignment-internship.component';

declare var $: any;

@Component({
  selector: 'app-internship',
  templateUrl: './internship.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [DialogService]
})
export class InternshipComponent extends Grid implements OnInit {
  public host_image: any;
  public isCreate = false;
  public internship: Internship;
  public years = [];
  public internship_name = '';
  public academic_year = '';
  public internship_classes: any;
  public selected_internship_id = '1';
  public selected_internship: Internship = {internship_id_rcd: '', internship_name: ''};
  public visibleSidebar = false;
  public treeNodes: TreeNode[];
  public selectedFiles: TreeNode[] = [];
  dataArray: string[] = [];
  public selected_class_ids: string[] = [];
  public visible = false;
  public internship_class_table_invisible = false;

  public constructor(injector: Injector, public dialogService: DialogService) {
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
      internship_name: new FormControl(''),
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
  search(): void {
    super.search();
    this.internship_class_table_invisible = true;
  }

  public loadDropdowns() {
    this.internship_class_table_invisible = true;
    console.log(this.internship_class_table_invisible);
    this.search();
  }

  public ngOnInit() {
    this.internship = new Internship();
    this.loadDropdowns();
    /*for (let i = 2015; i < 2022; i++) {
      this.years = [...this.years, { id: i, label: i + '-' + (i + 1) }];
    }*/
    let arrRequest = this.getArrayRequest();
    arrRequest.push(
      this._apiService.post('/api/adapter/execute', {
        Method: { Method: 'GET' },
        Url: '/api/internship-class/get-all-academic-years-by-internship',
        Module: 'LEAD',
      }),
    );
    Observable.combineLatest(arrRequest).subscribe((res: any) => {
      res[0].data.forEach((value) => {
        this.years = [...this.years, {id: value.academic_year, label: value.academic_year}];
      });
      setTimeout(() => {
        this._changeDetectorRef.detectChanges();
      }, 200);
      console.log(this.years);
    });
  }

  public handleChangeYear(e) {
    this.academic_year = e;
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
        internship_name: new FormControl('', [
          Validators.required,
          Validators.maxLength(100),
        ]),
        academic_year: new FormControl('', [
          Validators.required,
          Validators.maxLength(9),
        ]),
        semester: new FormControl('', [
          Validators.required,
          Validators.pattern('[1-3]'),
          Validators.max(2),
          Validators.min(1),
        ]),
        number_of_weeks: new FormControl('', [
          Validators.required,
          Validators.max(12),
          Validators.min(10),
        ]),
        start_date: new FormControl('', [
          Validators.required
        ])
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
  public formatDate(date) {
    return new Date(date);
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
        this.internship.start_date = new Date(this.internship.start_date);
        this.updateForm = new FormGroup({
          internship_id_rcd: new FormControl('', [
            Validators.required,
            Validators.maxLength(10),
          ]),
          internship_name: new FormControl('', [
            Validators.required,
            Validators.maxLength(100),
          ]),
          academic_year: new FormControl('', [
            Validators.required,
            Validators.maxLength(9),
          ]),
          semester: new FormControl('', [
            Validators.required,
            Validators.pattern('[1-3]'),
            Validators.max(2),
            Validators.min(1),
          ]),
          number_of_weeks: new FormControl('', [
            Validators.required,
            Validators.max(12),
            Validators.min(10),
          ]),
          start_date: new FormControl('', [
            Validators.required
          ])
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
  public getInternshipClass(row) {
    this.selected_internship = <Internship> row;
    let arrRequest = this.getArrayRequest();
    arrRequest.push(
      this._apiService.post('/api/adapter/execute', {
        Method: { Method: 'GET' },
        Url: '/api/internship-class/search/' + row.internship_id_rcd,
        Module: 'LEAD',
      }),
      this._apiService.post('/api/adapter/execute', {
        Method: { Method: 'GET' },
        Url: '/api/leader-internship/get-class',
        Module: 'LEAD',
      }),
    );
    Observable.combineLatest(arrRequest).subscribe((res: any) => {
      this.internship_classes = [];
      res[0].data.forEach((value) => {
        this.internship_classes = [...this.internship_classes, value];
      });
      this.selectedFiles = [];
      this.dataArray = [];
      for (let i = 0; i < this.internship_classes.length; i++) {
        this.dataArray.push(this.internship_classes[i].class_id_rcd);
      }
      this.selected_class_ids = [...this.dataArray];
      this.treeNodes = <TreeNode[]> JSON.parse(res[1].data);
      this.checkNode(this.treeNodes, this.dataArray);
      this.checkIfNodesSelectable(this.treeNodes);
      this.internship_class_table_invisible = false;
    });
    setTimeout(() => {
      this._changeDetectorRef.detectChanges();
    }, 200);
  }
  checkNode(nodes: TreeNode[], str: string[]) {
    for (let i = 0 ; i < nodes.length ; i++) {
      if (nodes[i].children) {
        if (!nodes[i].leaf && nodes[i].children[0].leaf) {
          for (let j = 0 ; j < nodes[i].children.length ; j++) {
            if (str.includes(nodes[i].children[j].data)) {
              if (!this.selectedFiles.includes(nodes[i].children[j])) {
                this.selectedFiles.push(nodes[i].children[j]);
              }
            }
          }
        }
        if (nodes[i].leaf) {
          return;
        }
        this.checkNode(nodes[i].children, str);
        let count = nodes[i].children.length;
        let c = 0;
        for (let j = 0 ; j < nodes[i].children.length ; j++) {
          if (this.selectedFiles.includes(nodes[i].children[j])) {
            c++;
          }
          if (nodes[i].children[j].partialSelected) { nodes[i].partialSelected = true; }
        }
        if (c == 0) {} else if (c == count) {
          nodes[i].partialSelected = false;
          if (!this.selectedFiles.includes(nodes[i])) {
            this.selectedFiles.push(nodes[i]);
          }
        } else {
          nodes[i].partialSelected = true;
        }
      }
    }
  }

  checkIfNodesSelectable(nodes: TreeNode[]) {
    for (let i = 0 ; i < nodes.length ; i++) {
      if (nodes[i].leaf) {
        nodes[i].selectable = true;
      } else if (!nodes[i].children) {
        nodes[i].selectable = false;
      } else {
        nodes[i].selectable = this.checkIfNodesSelectable(nodes[i].children);
      }
    }
    let result = false;
    for (let i = 0; i < nodes.length ; i++) {
      result = result || nodes[i].selectable;
    }
    return result;
  }
  nodeSelect(event) {
    this.addNode(event.node);
    this.selectedFiles = [];
    this.checkNode(this.treeNodes, this.dataArray);
  }

  nodeUnselect(event) {
    if (this.selected_class_ids.includes(event.node.data)) {
      this._confirmationService.confirm({
        message: 'Dữ liệu đã được lưu trong hệ thống. Bạn có chắc muốn xóa lớp "' + event.node.label + '" không?',
        accept: () => {
          this.removeNode(event.node);
          this.selectedFiles = [];
          this.checkNode(this.treeNodes, this.dataArray);
        },
        reject: () => {
          this.checkNode(this.treeNodes, this.dataArray);
        }
      });
    } else if (event.node.children) {
      this._confirmationService.confirm({
        message: 'Dữ liệu đã được lưu trong hệ thống. Bạn có chắc muốn xóa không?',
        accept: () => {
          this.removeNode(event.node);
          this.selectedFiles = [];
          this.checkNode(this.treeNodes, this.dataArray);
        },
        reject: () => {
          this.checkNode(this.treeNodes, this.dataArray);
        }
      });
    } else {
      this.removeNode(event.node);
      this.selectedFiles = [];
      this.checkNode(this.treeNodes, this.dataArray);
    }
  }

  removeNode(node: TreeNode) {
    if (!node.children) {
      this.dataArray.splice(this.dataArray.indexOf(node.data), 1);
      return;
    }
    for (let i = 0 ; i < node.children.length ; i++) {
      this.removeNode(node.children[i]);
    }
  }

  addNode(node: TreeNode) {
    if (!node.children) {
      if (!this.dataArray.includes(node.data)) {
        this.dataArray.push(node.data);
      }
      return;
    }
    for (let i = 0 ; i < node.children.length ; i++) {
      this.addNode(node.children[i]);
    }
  }
  saveInternshipClasses() {
    let addedclass_ids = this.getAddedClassId(this.selected_class_ids, this.dataArray);
    addedclass_ids = addedclass_ids.filter(item => item != undefined);
    let removedclass_ids = this.getRemovedClassId(this.selected_class_ids, this.dataArray);
    removedclass_ids = removedclass_ids.filter(item => item != undefined);
    let arrRequest = this.getArrayRequest();
    this.visibleSidebar = false;
    // call API
    // create
    for (let i = 0; i < addedclass_ids.length; i++) {
      let internship_class = new InternshipClassModel();
      internship_class.internship_id_rcd = this.selected_internship.internship_id_rcd;
      internship_class.class_id_rcd = addedclass_ids[i];
      console.log(internship_class.internship_id_rcd);
      arrRequest.push(
        this._apiService.post('/api/adapter/execute', {
          Method: { Method: 'POST' },
          Url: '/api/internship-class/create-internship-class',
          Module: 'LEAD',
          Data: JSON.stringify(internship_class)
        }),
      );
    }
    // delete
    let removed_internship_class_id: Guid[] = [];
    for (let i = 0; i < removedclass_ids.length; i++) {
      /*for (let j = 0; j < this.internship_classes.length; j++) {

      }*/
      this.internship_classes.forEach((value) => {
        if (value.class_id_rcd == removedclass_ids[i]) {
          removed_internship_class_id.push(value.internship_class_id);
        }
      });
    }
    removed_internship_class_id.forEach((value) => {
      arrRequest.push(
        this._apiService.post('/api/adapter/execute', {
          Method: { Method: 'POST' },
          Url: '/api/internship-class/delete-by-internship-class-id',
          Module: 'LEAD',
          Data: JSON.stringify(value),
        }),
      );
    });

    if (this.submitting == false) {
      this.submitting = true;
      Observable.combineLatest(arrRequest).subscribe((res: any) => {
        this._functionConstants.ShowNotification(
          ENotificationType.GREEN,
          res.messageCode
        );
        this.submitting = false;
        this.getInternshipClass(this.selected_internship);
      },
        (error) => {
          this.submitting = false;
          this._functionConstants.ShowNotification(
            ENotificationType.RED,
            error.messageCode
          );
        });
      this.submitting = false;
    }

  }


  getAddedClassId(pre: string[], post: string[]): string[] {
    let result: string[] = [];
    for (let i = 0; i < post.length; i++) {
      if (!pre.includes(post[i]))  {
        result.push(post[i]);
      }
    }
    return result;
  }
  getRemovedClassId(pre: string[], post: string[]): string[] {
    let result: string[] = [];
    for (let i = 0; i < pre.length; i++) {
      if (!post.includes(pre[i]))  {
        result.push(pre[i]);
      }
    }
    return result;
  }

  showDialog() {
    console.log(1);
    this.visible = true;
  }
  saveSelectedICId(internship_class_id: Guid) {

  }
  public removeInternshipClass(items: any[]) {
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
                  removeIds.push(ds.internship_class_id);
                }
              });
              if (removeIds.length > 0) {
                this._apiService
                  .post('/api/adapter/execute', {
                    Method: { Method: 'POST' },
                    Url: '/api/internship-class/delete-by-internship-class-id',
                    Module: 'LEAD',
                    Data: JSON.stringify(removeIds[0]),
                  })
                  .subscribe((res) => {
                    this.search();
                    this.selectedDataTableItems = [];
                    this._functionConstants.ShowNotification(
                      ENotificationType.GREEN,
                      res.messageCode
                    );
                    this.getInternshipClass(this.selected_internship);
                    setTimeout(() => {
                      this._changeDetectorRef.detectChanges();
                    }, 200);
                  });
              }
            },
          });
        });
    }
    /*this.checkNode(this.treeNodes, this.dataArray);
    this.checkIfNodesSelectable(this.treeNodes);*/
/*    this.getInternshipClass(this.selected_internship);*/
  }

}
