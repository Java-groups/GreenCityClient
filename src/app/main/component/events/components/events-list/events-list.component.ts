import { Component, Injector, OnDestroy, OnInit } from '@angular/core';
import { EventPageResponceDto, PaginationInterface } from '../../models/events.interface';
import { UserOwnAuthService } from '@auth-service/user-own-auth.service';
import { ReplaySubject } from 'rxjs';
import { LocalStorageService } from '@global-service/localstorage/local-storage.service';
import { Store } from '@ngrx/store';
import { IAppState } from 'src/app/store/state/app.state';
import { IEcoEventsState } from 'src/app/store/state/ecoEvents.state';
import { GetEcoEventsByPageAction } from 'src/app/store/actions/ecoEvents.actions';
import { LanguageService } from '../../../../i18n/language.service';
import { Router } from '@angular/router';
import { AuthModalComponent } from '@global-auth/auth-modal/auth-modal.component';
import { MatDialog } from '@angular/material/dialog';
import { eventTimeList, TagsArray, eventStatusList, tempLocationList } from '../../models/event-consts';

@Component({
  selector: 'app-events-list',
  templateUrl: './events-list.component.html',
  styleUrls: ['./events-list.component.scss']
})
export class EventsListComponent implements OnInit, OnDestroy {
  public eventsList: EventPageResponceDto[] = [];

  public isLoggedIn: string;
  private destroyed$: ReplaySubject<any> = new ReplaySubject<any>(1);
  ecoEvents$ = this.store.select((state: IAppState): IEcoEventsState => state.ecoEventsState);

  private visitedPagesArr: number[];

  public items = 1;
  public total = 0;
  public page = 0;
  private eventsPerPage = 6;
  selectedFilters = ['Lviv', 'Kyiv', 'Odesa', 'Kharkiv', 'Donetsk']; // test data,should be deleted when back-end is ready
  searchToggle = false;
  bookmarkSelected = false;
  selectedEventTime: any;
  eventTimeList = eventTimeList;
  typeList = TagsArray;
  statusList = eventStatusList;
  eventLocationList = tempLocationList;
  allSelected = false;
  private dialog: MatDialog;

  public pageConfig(items: number, page: number, total: number): PaginationInterface {
    return {
      itemsPerPage: items,
      currentPage: page,
      totalItems: total
    };
  }

  constructor(
    private store: Store,
    private userOwnAuthService: UserOwnAuthService,
    private languageService: LanguageService,
    private localStorageService: LocalStorageService,
    private router: Router,
    public injector: Injector
  ) {
    this.dialog = injector.get(MatDialog);
  }

  ngOnInit(): void {
    this.localStorageService.setEditMode('canUserEdit', false);
    this.checkUserSingIn();
    this.userOwnAuthService.getDataFromLocalStorage();

    this.ecoEvents$.subscribe((res: IEcoEventsState) => {
      this.visitedPagesArr = res.visitedPages;
      this.total = res.totalPages;
      this.page = res.pageNumber;
      this.eventsList = res.eventsList[this.page];
      if (!this.visitedPagesArr.some((it) => it === 0)) {
        this.store.dispatch(GetEcoEventsByPageAction({ currentPage: this.page, numberOfEvents: this.eventsPerPage }));
      }
    });
  }

  toggleAllSelection(): void {
    this.allSelected = !this.allSelected;
    this.selectedEventTime = this.allSelected ? this.eventTimeList : [];
  }

  search(): void {
    this.searchToggle = !this.searchToggle;
  }

  showFavourite(): void {
    this.bookmarkSelected = !this.bookmarkSelected;
  }

  deleteOneFilter(index): void {
    this.selectedFilters.splice(index, 1);
  }

  resetAll(): void {
    this.selectedFilters.splice(0, this.selectedFilters.length);
  }

  public checkPagination(): boolean {
    return this.total > this.items;
  }

  private checkUserSingIn(): void {
    this.userOwnAuthService.credentialDataSubject.subscribe((data) => (this.isLoggedIn = data && data.userId));
  }

  public setPage(event: number): void {
    this.store.dispatch(GetEcoEventsByPageAction({ currentPage: event - 1, numberOfEvents: this.eventsPerPage }));
  }

  public getLangValue(uaValue: string, enValue: string): string {
    return this.languageService.getLangValue(uaValue, enValue) as string;
  }

  public isUserLoggedRedirect(): void {
    this.isLoggedIn ? this.router.navigate(['/events', 'create-event']) : this.openAuthModalWindow('sign-in');
  }

  public openAuthModalWindow(page: string): void {
    this.dialog.open(AuthModalComponent, {
      hasBackdrop: true,
      closeOnNavigation: true,
      panelClass: ['custom-dialog-container'],
      data: {
        popUpName: page
      }
    });
  }

  ngOnDestroy(): void {
    this.destroyed$.next(true);
    this.destroyed$.complete();
  }
}
