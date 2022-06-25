import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ImagesContainerComponent } from './images-container.component';
import { CUSTOM_ELEMENTS_SCHEMA, ElementRef } from '@angular/core';
import { FileHandle } from 'src/app/ubs/ubs-admin/models/file-handle.model';

xdescribe('ImagesContainerComponent', () => {
  let component: ImagesContainerComponent;
  let fixture: ComponentFixture<ImagesContainerComponent>;

  const files: FileHandle[] = [
    { url: 'http://', file: new File(['some content'], 'text-file.jpeg', { type: 'image/jpeg' }) },
    { url: 'http://', file: new File(['some content'], 'text-file.jpeg', { type: 'image/jpeg' }) }
  ];

  const dataFileMock = new File([''], 'test-file.jpeg');
  const event = { target: { files: [dataFileMock] } };

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ImagesContainerComponent],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ImagesContainerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('ngOnInit expect initImages should be call', () => {
    const spy = spyOn(component as any, 'initImages');
    component.ngOnInit();
    expect(spy).toHaveBeenCalledTimes(1);
  });

  it('initImages images length to be 2', () => {
    component.images = [];
    (component as any).imagesCount = 2;
    (component as any).initImages();
    expect(component.images.length).toBe(2);
  });

  it('filesDropped expect transferFile should be called once', () => {
    const spy1 = spyOn(component as any, 'transferFile');

    (component as any).filesDropped(files);

    expect(spy1).toHaveBeenCalledTimes(1);
  });

  it('transferFile expect imgArray.length to be 1', () => {
    (component as any).imgArray = [];
    (component as any).transferFile(files[0].file);

    expect((component as any).imgArray.length).toBe(1);
  });

  it('assignImage expect images.src to be imageSrc', () => {
    (component as any).assignImage('imageSrc');
    expect(component.images[0].src).toBe('imageSrc');
  });

  it('deleteImage expect images.src to be falcy ', () => {
    component.images = [
      { isLabel: false, label: '+', src: 'imageSrc' },
      { isLabel: true, label: '+', src: null }
    ];
    component.deleteImage(0);
    expect(component.images[0].src).toBeFalsy();
  });

  it('loadFile expect  transferFile should be called with specified argument', () => {
    const transferFileSpy = spyOn(component as any, 'transferFile');
    component.loadFile(event as any);
    expect(transferFileSpy).toHaveBeenCalledWith(dataFileMock);
  });
});
