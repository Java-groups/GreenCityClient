import { Language } from './../../../../i18n/Language';
import { CUSTOM_ELEMENTS_SCHEMA, Injectable, EventEmitter, Pipe, PipeTransform } from '@angular/core';
import { async, ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { MatDialogModule } from '@angular/material/dialog';
import { RouterTestingModule } from '@angular/router/testing';
import { BsModalRef, ModalModule } from 'ngx-bootstrap/modal';
import { TagsArray } from '../../../events/models/event-consts';
import { Store } from '@ngrx/store';
import { EventsListItemComponent } from './events-list-item.component';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { Router } from '@angular/router';
import { of } from 'rxjs/internal/observable/of';
import { EventsService } from '../../../events/services/events.service';
import { LocalStorageService } from '@global-service/localstorage/local-storage.service';
import { RatingModule } from 'ngx-bootstrap/rating';
import { BehaviorSubject, Subject } from 'rxjs';
import { UserOwnAuthService } from '@auth-service/user-own-auth.service';
import { TagObj } from '../../../events/models/events.interface';
import { LanguageService } from 'src/app/main/i18n/language.service';
import { AddAttenderEcoEventsByIdAction, RemoveAttenderEcoEventsByIdAction } from 'src/app/store/actions/ecoEvents.actions';

@Injectable()
class TranslationServiceStub {
  public onLangChange = new EventEmitter<any>();
  public onTranslationChange = new EventEmitter<any>();
  public onDefaultLangChange = new EventEmitter<any>();
  public addLangs(langs: string[]) {}
  public getLangs() {
    return 'en-us';
  }
  public getBrowserLang() {
    return '';
  }
  public getBrowserCultureLang() {
    return '';
  }
  public use(lang: string) {
    return '';
  }
  public get(key: any): any {
    return of(key);
  }
  public setDefaultLang() {
    return true;
  }
}

@Pipe({ name: 'dateLocalisation' })
class DatePipeMock implements PipeTransform {
  transform(value: string): string {
    return value;
  }
}

describe('EventsListItemComponent', () => {
  let component: EventsListItemComponent;
  let fixture: ComponentFixture<EventsListItemComponent>;
  let translate: TranslateService;
  let store: Store;

  const eventMock = {
    description: 'tralalalal',
    additionalImages: [],
    tags: [
      { id: 1, nameUa: 'Соціальний', nameEn: 'Social' },
      { id: 13, nameUa: 'Екологічний', nameEn: 'Environmental' },
      { id: 14, nameUa: 'Економічний', nameEn: 'Economic' }
    ],
    dates: [
      {
        coordinates: {
          addressEn: 'address',
          addressUa: 'address',
          latitude: 0,
          longitude: 0
        },
        id: null,
        event: null,
        startDate: '2022-05-31T00:00:00+03:00',
        finishDate: '2022-05-31T23:59:00+03:00',
        onlineLink: null
      }
    ],
    id: 307,
    organizer: { id: 5, name: 'Mykola Kovalushun', organizerRating: 3 },
    title: 'dddddddd',
    titleImage: 'https://-fc27f19b10e0apl',
    isSubscribed: true,
    open: true
  };

  const fakeItemTags: TagObj[] = [
    {
      nameEn: 'Environmental',
      nameUa: 'Екологічний',
      isActive: true
    },
    {
      nameEn: 'Social',
      nameUa: 'Соціальний',
      isActive: true
    },
    {
      nameEn: 'eco',
      nameUa: 'Соціальний',
      isActive: false
    }
  ];

  const fakeActiveTags: TagObj[] = [
    {
      nameEn: 'Environmental',
      nameUa: 'Екологічний',
      isActive: true
    },
    {
      nameEn: 'Social',
      nameUa: 'Соціальний',
      isActive: true
    }
  ];

  const routerSpy = { navigate: jasmine.createSpy('navigate') };
  const storeMock = jasmine.createSpyObj('store', ['dispatch']);
  const mockLang = 'ua';
  const bsModalRefMock = jasmine.createSpyObj('bsModalRef', ['hide']);
  const EventsServiceMock = jasmine.createSpyObj('EventsService', ['getEventById ', 'deleteEvent', 'getAllAttendees']);
  EventsServiceMock.getEventById = () => of(eventMock);
  EventsServiceMock.getAllAttendees = () => of([]);
  EventsServiceMock.deleteEvent = () => of(true);

  let localStorageServiceMock: LocalStorageService;
  localStorageServiceMock = jasmine.createSpyObj('LocalStorageService', [
    'getCurrentLanguage',
    'setEditMode',
    'setEventForEdit',
    'userIdBehaviourSubject',
    'languageSubject'
  ]);
  localStorageServiceMock.languageSubject = new Subject();
  localStorageServiceMock.userIdBehaviourSubject = new BehaviorSubject(5);
  localStorageServiceMock.languageBehaviourSubject = new BehaviorSubject('ua');

  const languageServiceMock = jasmine.createSpyObj('languageService', ['getLangValue']);
  languageServiceMock.getLangValue = (valUa: string, valEn: string) => {
    return valUa;
  };

  let translateServiceMock: TranslateService;
  translateServiceMock = jasmine.createSpyObj('TranslateService', ['setDefaultLang']);
  translateServiceMock.setDefaultLang = (lang: string) => of();
  translateServiceMock.get = () => of(true);
  localStorageServiceMock.getCurrentLanguage = () => mockLang as Language;

  let userOwnAuthServiceMock: UserOwnAuthService;
  userOwnAuthServiceMock = jasmine.createSpyObj('UserOwnAuthService', ['getDataFromLocalStorage']);
  userOwnAuthServiceMock.getDataFromLocalStorage = () => true;
  userOwnAuthServiceMock.credentialDataSubject = new Subject();
  userOwnAuthServiceMock.isLoginUserSubject = new BehaviorSubject(true);

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [EventsListItemComponent, DatePipeMock],
      providers: [
        { provide: BsModalRef, useValue: bsModalRefMock },
        { provide: Store, useValue: storeMock },
        { provide: Router, useValue: routerSpy },
        { provide: EventsService, useValue: EventsServiceMock },
        { provide: LocalStorageService, useValue: localStorageServiceMock },
        { provide: LanguageService, useValue: languageServiceMock },
        { provide: TranslateService, useClass: TranslationServiceStub },
        { provide: UserOwnAuthService, useValue: userOwnAuthServiceMock }
      ],
      imports: [RouterTestingModule, MatDialogModule, TranslateModule.forRoot(), RatingModule.forRoot(), ModalModule.forRoot()],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    }).compileComponents();
  }));

  beforeEach(() => {
    translate = TestBed.inject(TranslateService);
    fixture = TestBed.createComponent(EventsListItemComponent);
    component = fixture.componentInstance;
    component.event = eventMock as any;
    component.itemTags = TagsArray;
    component.btnStyle = 'string';
    component.nameBtn = 'string';
    component.rate = 3;
    component.isRegistered = false;
    component.isReadonly = false;
    component.isPosting = false;
    component.isRated = false;
    component.max = 3;

    component.deleteDialogData = {
      popupTitle: 'homepage.events.delete-title',
      popupConfirm: 'homepage.events.delete-yes',
      popupCancel: 'homepage.events.delete-no'
    };

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should return ua value by getLangValue', () => {
    const value = component.getLangValue('value', 'enValue');
    expect(value).toBe('value');
  });

  describe('ngOnInit', () => {
    it('tags.length shoud be 3 in ngOnInit', () => {
      component.itemTags = [];
      component.ngOnInit();
      expect(component.itemTags.length).toBe(3);
    });

    it(`filterTags should be called in ngOnInit`, () => {
      spyOn(component, 'filterTags');
      component.ngOnInit();
      expect(component.filterTags).toHaveBeenCalled();
    });

    it(`should check whether getAllAttendees returns correct value`, () => {
      component.ngOnInit();
      EventsServiceMock.getAllAttendees();
      expect(component.attendees).toEqual([]);
    });

    it(`should check whether active tags are filtered properly`, () => {
      component.itemTags = fakeItemTags;
      component.filterTags(component.event.tags);
      expect(component.activeTags).toEqual(fakeActiveTags);
    });

    it(`initAllStatusesOfEvent should be called in ngOnInit`, () => {
      spyOn(component, 'initAllStatusesOfEvent');
      component.ngOnInit();
      expect(component.initAllStatusesOfEvent).toHaveBeenCalled();
    });

    it(`rate should be called in ngOnInit`, () => {
      component.ngOnInit();
      component.rate = Math.round(component.event.organizer.organizerRating);
      expect(component.rate).toBe(3);
    });

    it(`subscribeToLangChange should be called in ngOnInit`, () => {
      spyOn(component, 'subscribeToLangChange');
      component.ngOnInit();
      expect(component.subscribeToLangChange).toHaveBeenCalled();
    });

    it(`bindLang should be called in ngOnInit`, () => {
      spyOn(component, 'bindLang');
      component.ngOnInit();
      expect(component.bindLang).toHaveBeenCalled();
    });
  });

  describe('CheckButtonStatus', () => {
    it('should set btnStyle and nameBtn correctly when user is owner and event is active', () => {
      const component = TestBed.createComponent(EventsListItemComponent);
      component.componentInstance.event = eventMock;
      component.componentInstance.userId = eventMock.organizer.id;
      spyOn(component.componentInstance, 'checkIsActive').and.returnValue(true);
      component.componentInstance.checkButtonStatus();
      expect(component.componentInstance.btnStyle).toEqual(component.componentInstance.styleBtn.secondary);
      expect(component.componentInstance.nameBtn).toEqual(component.componentInstance.btnName.edit);
    });

    it('should set btnStyle and nameBtn correctly when user is owner and event is unactive', () => {
      const component = TestBed.createComponent(EventsListItemComponent);
      component.componentInstance.event = eventMock;
      component.componentInstance.userId = eventMock.organizer.id;
      spyOn(component.componentInstance, 'checkIsActive').and.returnValue(false);
      component.componentInstance.checkButtonStatus();
      expect(component.componentInstance.btnStyle).toEqual(component.componentInstance.styleBtn.secondary);
      expect(component.componentInstance.nameBtn).toEqual(component.componentInstance.btnName.delete);
    });

    it('should set btnStyle and nameBtn correctly when user is subscribe and event is active', () => {
      const component = TestBed.createComponent(EventsListItemComponent);
      eventMock.isSubscribed = true;
      component.componentInstance.event = eventMock;
      spyOn(component.componentInstance, 'checkIsActive').and.returnValue(true);
      component.componentInstance.checkButtonStatus();
      expect(component.componentInstance.btnStyle).toEqual(component.componentInstance.styleBtn.secondary);
      expect(component.componentInstance.nameBtn).toEqual(component.componentInstance.btnName.cancel);
    });

    it('should set btnStyle and nameBtn correctly when user is unsubscribed and event is active', () => {
      const component = TestBed.createComponent(EventsListItemComponent);
      eventMock.isSubscribed = false;
      component.componentInstance.event = eventMock;
      spyOn(component.componentInstance, 'checkIsActive').and.returnValue(true);
      component.componentInstance.checkButtonStatus();
      expect(component.componentInstance.btnStyle).toEqual(component.componentInstance.styleBtn.primary);
      expect(component.componentInstance.nameBtn).toEqual(component.componentInstance.btnName.join);
    });

    it('should set btnStyle and nameBtn correctly when user is subscribed and event is unactive', () => {
      const component = TestBed.createComponent(EventsListItemComponent);
      component.componentInstance.event = eventMock;
      eventMock.isSubscribed = true;
      spyOn(component.componentInstance, 'checkIsActive').and.returnValue(false);
      component.componentInstance.checkButtonStatus();
      expect(component.componentInstance.btnStyle).toEqual(component.componentInstance.styleBtn.primary);
      expect(component.componentInstance.nameBtn).toEqual(component.componentInstance.btnName.rate);
    });

    it('should set btnStyle and nameBtn correctly when user is unsubscribed and event is unactive', () => {
      const component = TestBed.createComponent(EventsListItemComponent);
      eventMock.isSubscribed = false;
      component.componentInstance.event = eventMock;
      spyOn(component.componentInstance, 'checkIsActive').and.returnValue(false);
      component.componentInstance.checkButtonStatus();
      expect(component.componentInstance.btnStyle).toEqual(component.componentInstance.styleBtn.hiden);
    });
  });

  describe('ButtonAction', () => {
    it('should dispatch RemoveAttenderEcoEventsByIdAction when cancel button is clicked', () => {
      component.buttonAction(component.btnName.cancel);
      expect(storeMock.dispatch).toHaveBeenCalledWith(RemoveAttenderEcoEventsByIdAction({ id: component.event.id }));
    });

    it('should dispatch AddAttenderEcoEventsByIdAction when join button is clicked', () => {
      component.buttonAction(component.btnName.join);
      expect(storeMock.dispatch).toHaveBeenCalledWith(AddAttenderEcoEventsByIdAction({ id: component.event.id }));
    });

    it('should call openModal method when rate button is clicked', () => {
      spyOn(component, 'openModal');
      component.buttonAction(component.btnName.rate);
      expect(component.openModal).toHaveBeenCalled();
    });

    it('should call deleteEvent method when delete button is clicked', () => {
      spyOn(component, 'deleteEvent');
      component.buttonAction(component.btnName.delete);
      expect(component.deleteEvent).toHaveBeenCalled();
    });

    it('should set edit mode and navigate to create event page when edit button is clicked', () => {
      component.buttonAction(component.btnName.edit);
      expect(localStorageServiceMock.setEditMode).toHaveBeenCalledWith('canUserEdit', true);
      expect(localStorageServiceMock.setEventForEdit).toHaveBeenCalledWith('editEvent', component.event);
      expect(component.router.navigate).toHaveBeenCalledWith(['events/', 'create-event']);
    });
  });

  describe('Routing', () => {
    it(`should be clicked and called routeToEvent method`, fakeAsync(() => {
      spyOn(component, 'routeToEvent');
      const button = fixture.debugElement.nativeElement.querySelector('button:nth-child(1)');
      button.click();
      tick();
      expect(component.routeToEvent).toHaveBeenCalled();
    }));

    it(`should navigate to events`, () => {
      component.routeToEvent();
      expect(routerSpy.navigate).toHaveBeenCalledWith(['/events', component.event.id]);
    });
  });

  describe('Filtering tags', () => {
    it('filterTags tags[1] should be active', () => {
      (component as any).filterTags([{ nameEn: 'Social', nameUa: 'Соціальний', id: 1 }]);
      expect(component.itemTags[1].isActive).toBeTruthy();
    });
  });

  it('should check weather title which length is shorter than 40 characters cut correctly', () => {
    component.event.title = 'title';
    expect(component.cutTitle()).toEqual('title');
  });

  it('should check weather title which length is longer than 30 characters cut correctly', () => {
    component.event.title = '40 characters long title has to be cut as it is to long';
    const newTitle = component.event.title.slice(0, 30) + '...';
    expect(component.cutTitle()).toEqual(newTitle);
  });

  it('should check weather description which length is shorter than 40 characters cut correctly', () => {
    component.event.description = 'description';
    expect(component.cutDescription()).toEqual('description');
  });

  it('should check weather description which length is longer than 90 characters cut correctly', () => {
    component.event.description = 'Lorem ipsum dolor sit amet, consectetur adipisicing elit. Dignissimos exercitationem fugiat incidunt';
    const newDescription = component.event.description.slice(0, 90) + '...';
    expect(component.cutDescription()).toEqual(newDescription);
  });

  describe('ngOnDestroy', () => {
    it('should unsubscribe of language change', () => {
      component.langChangeSub = of(true).subscribe();
      component.ngOnDestroy();
      expect(component.langChangeSub.closed).toBeTruthy();
    });
  });
});
