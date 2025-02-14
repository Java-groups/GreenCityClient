import { authImages, ubsAuthImages } from './../../../../image-pathes/auth-images';
import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { LiveAnnouncer } from '@angular/cdk/a11y';
import { Subject } from 'rxjs';
import { Router } from '@angular/router';

@Component({
  selector: 'app-auth-modal',
  templateUrl: './auth-modal.component.html',
  styleUrls: ['./auth-modal.component.scss']
})
export class AuthModalComponent implements OnInit, OnDestroy {
  private destroySub: Subject<boolean> = new Subject<boolean>();
  public authImages: { mainImage: string; cross: string; hiddenEye: string; openEye: string; google: string };
  public authPage: string;
  public authImageValue: boolean;

  constructor(
    private announcer: LiveAnnouncer,
    private router: Router,
    public matDialogRef: MatDialogRef<AuthModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data
  ) {}

  ngOnInit(): void {
    this.authImages = this.router.url.includes('ubs') ? ubsAuthImages : authImages;
    this.setAuthPage();
    this.announce();
  }

  public announce() {
    this.announcer.announce('Welcome to login page', 'assertive');
  }

  public changeAuthPage(page: string): void {
    this.authPage = page;
  }

  public closeWindow(): void {
    this.matDialogRef.close();
  }

  private setAuthPage(): void {
    this.authPage = this.data.popUpName;
  }

  ngOnDestroy() {
    this.destroySub.next(true);
    this.destroySub.unsubscribe();
  }
}
