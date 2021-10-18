import { Component, Input, Output, EventEmitter } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FriendModel } from '@global-user/models/friend.model';

@Component({
  selector: 'app-friend-item',
  templateUrl: './friend-item.component.html',
  styleUrls: ['./friend-item.component.scss']
})
export class FriendItemComponent {
  public userId: number;
  @Input() friend: FriendModel;
  @Input() btnName: string;
  @Output() friendEventEmit = new EventEmitter<number>();

  constructor(private router: Router, private route: ActivatedRoute) {
    this.userId = +this.route.snapshot.params.userId;
  }

  private friendEvent(id: number): void {
    this.friendEventEmit.emit(id);
  }

  private toUsersInfo(): void {
    if (this.userId) return;
    this.router.navigate([this.friend.name, this.friend.id], { relativeTo: this.route });
  }

  public clickHandler(event: MouseEvent): void {
    const target = (event.target as HTMLElement).tagName;
    target === 'BUTTON' ? this.friendEvent(this.friend.id) : this.toUsersInfo();
  }
}
