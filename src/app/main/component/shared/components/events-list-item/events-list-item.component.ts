import {
  AddAttenderEcoEventsByIdAction,
  DeleteEcoEventAction,
  RemoveAttenderEcoEventsByIdAction
} from 'src/app/store/actions/ecoEvents.actions';
import { Store } from '@ngrx/store';
import { take } from 'rxjs/operators';
import { LocalStorageService } from '@global-service/localstorage/local-storage.service';
import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { TagsArray } from '../../../events/models/event-consts';
import { EventPageResponceDto, TagDto, TagObj } from '../../../events/models/events.interface';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { EventsListItemModalComponent } from './events-list-item-modal/events-list-item-modal.component';
import { MatDialog } from '@angular/material/dialog';
import { DialogPopUpComponent } from 'src/app/shared/dialog-pop-up/dialog-pop-up.component';
import { TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-events-list-item',
  templateUrl: './events-list-item.component.html',
  styleUrls: ['./events-list-item.component.scss']
})
export class EventsListItemComponent implements OnInit {
  @Input() event: EventPageResponceDto;

  public itemTags: Array<TagObj>;

  public nameBtn: string;
  public styleBtn: string;
  public disabledMode = false;
  public rate: number;

  public isJoined: boolean;
  public isEventOpen: boolean;
  public isOwner: boolean;
  public isRegistered: boolean;
  public isFinished: boolean;
  public isReadonly = false;
  public isPosting: boolean;
  public isRated: boolean;

  public max = 3;

  public bsModalRef: BsModalRef;

  public langChangeSub: Subscription;

  deleteDialogData = {
    popupTitle: 'homepage.events.delete-title',
    popupConfirm: 'homepage.events.delete-yes',
    popupCancel: 'homepage.events.delete-no'
  };

  constructor(
    private router: Router,
    private localStorageService: LocalStorageService,
    private modalService: BsModalService,
    private dialog: MatDialog,
    private store: Store,
    private translate: TranslateService
  ) {}

  ngOnInit(): void {
    this.itemTags = TagsArray.reduce((ac, cur) => [...ac, { ...cur }], []);
    this.filterTags(this.event.tags);
    this.rate = Math.round(this.event.organizer.organizerRating);
    this.initAllStatusesOfEvent();
    this.checkAllStatusesOfEvent();
    this.subscribeToLangChange();
    this.bindLang(this.localStorageService.getCurrentLanguage());


  }

  public routeToEvent(): void {
    this.router.navigate(['/events', this.event.id]);
  }

  public filterTags(tags: Array<TagDto>) {
    this.itemTags.forEach((item) => (item.isActive = tags.some((name) => name.nameEn === item.nameEn)));
  }

  public initAllStatusesOfEvent(): void {
    this.isJoined = this.event.isSubscribed ? true : false;
    this.isEventOpen = this.event.open;
    this.isOwner = this.localStorageService.getUserId() === this.event.organizer.id;
    this.isRegistered = this.localStorageService.getUserId() ? true : false;
    this.isFinished = Date.parse(this.event.dates[0].finishDate) < Date.parse(new Date().toString());
    this.isRated = this.rate ? true : false;
  }

  public checkAllStatusesOfEvent(): void {
    if (this.isEventOpen && !this.isFinished) {
      this.checkIsOwner(this.isOwner);
    } else {
      if (this.isOwner) {
        this.nameBtn = 'event.btn-delete';
        this.styleBtn = 'secondary-global-button';
      } else {
        this.checkIsRate(this.isRated);
      }
    }
  }

  public checkIsOwner(isOwner: boolean): void {
    if (isOwner) {
      this.nameBtn = 'event.btn-edit';
      this.styleBtn = 'secondary-global-button';
    } else {
      this.nameBtn = this.isJoined ? 'event.btn-cancel' : 'event.btn-join';
      this.styleBtn = this.isJoined ? 'secondary-global-button' : 'primary-global-button';
    }
  }

  public checkIsRate(isRated: boolean): void {
    if (isRated) {
      this.nameBtn = 'event.btn-see';
      this.styleBtn = 'secondary-global-button';
    } else {
      this.disabledMode = this.isJoined ? false : true;
      this.nameBtn = !this.isEventOpen ? 'event.btn-see' : 'event.btn-rate';
      this.styleBtn = !this.isRated ? 'primary-global-button' : 'secondary-global-button';
    }
  }

  public buttonAction(): void {
    switch (this.isRegistered) {

      case this.isEventOpen && !this.isFinished:
        if (this.isOwner) {
          this.localStorageService.setEditMode('canUserEdit', true);
          this.localStorageService.setEventForEdit('editEvent', this.event);
          this.router.navigate(['events/', 'create-event']);
        } else {
          this.actionIsJoined(this.isJoined);
        }
        break;

      case false:
        if (this.isOwner) {
          this.deleteEvent();
        } else {
          if (!this.isRated && this.isEventOpen) {
            this.openModal();
          }
        }
        break;
      default:
        this.openModal();
    }
  }

  public actionIsJoined(isJoined: boolean) {
    if (isJoined) {
      this.store.dispatch(RemoveAttenderEcoEventsByIdAction({ id: this.event.id }));
      this.nameBtn = 'event.btn-join';
      this.styleBtn = 'primary-global-button';
      this.isReadonly = true;
      this.isJoined = false;
    } else {
      this.store.dispatch(AddAttenderEcoEventsByIdAction({ id: this.event.id }));
      this.nameBtn = 'event.btn-cancel';
      this.styleBtn = 'secondary-global-button';
      this.isReadonly = !this.event.organizer.organizerRating ? false : true;
      this.isJoined = true;
    }
  }

  public openModal(): void {
    const initialState = {
      id: this.event.id,
      isRegistered: this.isRegistered,
      max: this.max,
      isReadonly: this.isReadonly
    };

    this.bsModalRef = this.modalService.show(EventsListItemModalComponent, { class: 'modal-dialog-centered', initialState });
    this.bsModalRef.content.closeBtnName = 'event.btn-close';
  }

  public deleteEvent(): void {
    const matDialogRef = this.dialog.open(DialogPopUpComponent, {
      data: this.deleteDialogData,
      hasBackdrop: true,
      closeOnNavigation: true,
      disableClose: true,
      panelClass: '',
      width: '300px'
    });

    matDialogRef
      .afterClosed()
      .pipe(take(1))
      .subscribe((res) => {
        if (res) {
          this.store.dispatch(DeleteEcoEventAction({ id: this.event.id }));
          this.isPosting = true;
        }
      });
  }

  private bindLang(lang: string): void {
    this.translate.setDefaultLang(lang);
  }

  private subscribeToLangChange(): void {
    this.langChangeSub = this.localStorageService.languageSubject.subscribe(this.bindLang.bind(this));
  }
}
