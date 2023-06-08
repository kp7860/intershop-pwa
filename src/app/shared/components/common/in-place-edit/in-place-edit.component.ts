import { ChangeDetectionStrategy, Component, ElementRef, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'ish-in-place-edit',
  templateUrl: './in-place-edit.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrls: ['./in-place-edit.component.scss'],
})
export class InPlaceEditComponent {
  @Output() edited = new EventEmitter<void>();
  @Output() aborted = new EventEmitter<void>();

  private mode: 'view' | 'edit' = 'view';

  constructor(private host: ElementRef) {}

  changeEditMode() {
    if (this.mode === 'edit') {
      setTimeout(() => {
        this.host.nativeElement.querySelector('.form-control')?.focus();
      }, 200);
    }
    if (this.mode === 'view') {
      this.confirm();
      this.mode = 'edit';
    }
  }

  confirm() {
    this.mode = 'view';
    this.edited.emit();
  }

  cancel() {
    this.mode = 'view';
    this.aborted.emit();
  }

  get viewMode() {
    return this.mode === 'view';
  }
}
