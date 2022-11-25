import { Component, OnInit, ViewChild, ElementRef, Inject, OnDestroy } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialog } from '@angular/material/dialog';
import { LocalStorageService } from '@global-service/localstorage/local-storage.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { FileHandle } from '../../models/file-handle.model';
import { iif, of, Subject } from 'rxjs';
import { switchMap, take, takeUntil } from 'rxjs/operators';
import { OrderService } from '../../services/order.service';
import { ShowImgsPopUpComponent } from '../../../../shared/show-imgs-pop-up/show-imgs-pop-up.component';
import { NotTakenOutReasonImage, DataToSend } from '../../models/not-taken-out-reason.model';

@Component({
  selector: 'app-add-order-not-taken-out-reason',
  templateUrl: './add-order-not-taken-out-reason.component.html',
  styleUrls: ['./add-order-not-taken-out-reason.component.scss']
})
export class AddOrderNotTakenOutReasonComponent implements OnInit, OnDestroy {
  public closeButton = './assets/img/profile/icons/cancel.svg';
  private onDestroy$: Subject<boolean> = new Subject<boolean>();
  public notTakenOutReason: string;
  public adminName;
  private isUploading = false;
  public addNotTakenOutForm: FormGroup;
  maxNumberOfImgs = 6;
  name: string;
  file: File;
  private id;
  isImageSizeError = false;
  isImageTypeError = false;
  public images: NotTakenOutReasonImage[] = [];
  public imagesToDelete: string[] | null = [];

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private localStorageService: LocalStorageService,
    private fb: FormBuilder,
    private dialog: MatDialog,
    private orderService: OrderService,
    public dialogRef: MatDialogRef<AddOrderNotTakenOutReasonComponent>
  ) {
    this.id = data.id;
  }

  ngOnInit(): void {
    this.initForm();
    this.localStorageService.firstNameBehaviourSubject.pipe(takeUntil(this.onDestroy$)).subscribe((firstName) => {
      this.adminName = firstName;
    });
  }
  public initForm(): void {
    this.addNotTakenOutForm = this.fb.group({
      notTakenOutReason: ['', [Validators.required, Validators.maxLength(255)]]
    });
  }

  loadFiles(files: File[]): void {
    if (this.images.length + files.length > this.maxNumberOfImgs) {
      return;
    }
    this.isImageSizeError = false;
    this.isImageTypeError = false;
    files.forEach((file) => {
      this.checkFileExtensionAndSize(file);
      if (this.isImageTypeError || this.isImageSizeError) {
        return;
      }
      this.transferFile(file);
    });
  }

  private checkFileExtensionAndSize(file: File) {
    this.isImageSizeError = file.size >= 10000000;
    this.isImageTypeError = !(file.type === 'image/jpeg' || file.type === 'image/png');
  }

  public transferFile(imageFile: File): void {
    const reader: FileReader = new FileReader();
    reader.readAsDataURL(imageFile);
    reader.onload = () => {
      this.images.push({ src: reader.result as string, name: imageFile.name, file: imageFile });
    };
  }

  onFilesDropped(fileHandles: FileHandle[]): void {
    const files = fileHandles.map((handle) => handle.file);
    this.loadFiles(files);
  }

  onFilesSelected(event: any): void {
    this.loadFiles([...event.target.files]);
  }

  public openImage(image: NotTakenOutReasonImage): void {
    this.dialog.open(ShowImgsPopUpComponent, {
      hasBackdrop: true,
      panelClass: 'custom-img-pop-up',
      data: {
        imgIndex: this.images.indexOf(image),
        images: this.images.map((img) => ({ src: img.src }))
      }
    });
  }

  deleteImage(imageToDelete: NotTakenOutReasonImage): void {
    const isUploaded = imageToDelete.file === null;
    if (isUploaded) {
      this.imagesToDelete.push(imageToDelete.src);
    }
    this.images = this.images.filter((image) => image !== imageToDelete);
  }

  prepareDataToSend(): FormData {
    const notTakenOutReason = JSON.stringify(this.addNotTakenOutForm.value.notTakenOutReason);
    const formData: FormData = new FormData();
    formData.append('description', notTakenOutReason);
    this.images.forEach((image) => {
      if (image.file) {
        formData.append('images', image.file);
      }
    });
    return formData;
  }

  public send(): void {
    this.isUploading = true;
    const dataToSend = this.prepareDataToSend();
    of(true)
      .pipe(
        switchMap(() => this.orderService.addReasonForNotTakenOutOrder(dataToSend, this.id)),
        takeUntil(this.onDestroy$)
      )
      .subscribe(() => {
        this.dialogRef.close(true);
      });
  }

  public close(): void {
    const res = {
      action: 'cancel'
    };
    this.dialogRef.close(res);
  }

  ngOnDestroy(): void {
    this.onDestroy$.next();
    this.onDestroy$.complete();
  }
}
