import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { select, Store } from '@ngrx/store';
import { Observable } from 'rxjs/Observable';
import { PrivateCustomer } from '../../../../models/customer/private-customer.model';
import { SmbCustomerUser } from '../../../../models/customer/smb-customer-user.model';
import { CoreState } from '../../../store/core.state';
import { getLoggedInUser } from '../../../store/user';

@Component({
  selector: 'ish-login-status-container',
  templateUrl: './login-status.container.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoginStatusContainerComponent implements OnInit {
  user$: Observable<PrivateCustomer | SmbCustomerUser>;

  constructor(private store: Store<CoreState>) {}

  ngOnInit() {
    this.user$ = this.store.pipe(select(getLoggedInUser));
  }
}
