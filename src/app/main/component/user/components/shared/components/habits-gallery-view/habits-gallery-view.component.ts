import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { HabitAssignService } from '@global-service/habit-assign/habit-assign.service';
import { take } from 'rxjs/operators';
import { MatSnackBarComponent } from '@global-errors/mat-snack-bar/mat-snack-bar.component';
import { HabitInterface } from '../../../../../../interface/habit/habit.interface';
import { LocalStorageService } from '@global-service/localstorage/local-storage.service';
import { HabitService } from '@global-service/habit/habit.service';

@Component({
  selector: 'app-habits-gallery-view',
  templateUrl: './habits-gallery-view.component.html',
  styleUrls: ['./habits-gallery-view.component.scss']
})
export class HabitsGalleryViewComponent implements OnInit {
  @Input() habit: HabitInterface;
  private userId: number;
  public whiteStar = 'assets/img/icon/star-2.png';
  public greenStar = 'assets/img/icon/star-1.png';
  public stars = [this.whiteStar, this.whiteStar, this.whiteStar];
  public star: number;

  constructor(
    public router: Router,
    public snackBar: MatSnackBarComponent,
    public localStorageService: LocalStorageService,
    public habitAssignService: HabitAssignService,
    public habitService: HabitService
  ) {}

  ngOnInit() {
    this.getStars(this.habit.complexity);
    this.userId = this.localStorageService.getUserId();
  }

  public getStars(complexity: number) {
    for (this.star = 0; this.star < complexity; this.star++) {
      this.stars[this.star] = this.greenStar;
    }
  }

  public goHabitMore(): void {
    this.habitService.goToAddOrEditHabit(this.habit, this.userId);
  }

  public addHabit() {
    this.habitAssignService
      .assignHabit(this.habit.id)
      .pipe(take(1))
      .subscribe(() => {
        this.router.navigate(['profile', this.userId]);
        this.snackBar.openSnackBar('habitAdded');
      });
  }
}
