import { AfterViewInit, Component, ChangeDetectorRef, ViewChild, DoCheck, HostListener } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { UBSSubmitOrderComponent } from '../ubs-submit-order/ubs-submit-order.component';
import { UBSPersonalInformationComponent } from '../ubs-personal-information/ubs-personal-information.component';
import { UBSOrderDetailsComponent } from '../ubs-order-details/ubs-order-details.component';
import { MatHorizontalStepper } from '@angular/material/stepper';

@Component({
  selector: 'app-ubs-order-form',
  templateUrl: './ubs-order-form.component.html',
  styleUrls: ['./ubs-order-form.component.scss']
})
export class UBSOrderFormComponent implements AfterViewInit, DoCheck {
  firstStepForm: FormGroup;
  secondStepForm: FormGroup;
  thirdStepForm: FormGroup;

  completed = false;

  @ViewChild('firstStep') stepOneComponent: UBSOrderDetailsComponent;
  @ViewChild('secondStep') stepTwoComponent: UBSPersonalInformationComponent;
  @ViewChild('thirdStep') stepThreeComponent: UBSSubmitOrderComponent;
  @ViewChild(MatHorizontalStepper) stepper: MatHorizontalStepper;

  constructor(private cdr: ChangeDetectorRef) {}

  @HostListener('window:beforeunload') onClose() {
    return true;
  }

  ngAfterViewInit(): void {
    this.firstStepForm = this.stepOneComponent.orderDetailsForm;
    this.secondStepForm = this.stepTwoComponent.personalDataForm;
    this.thirdStepForm = this.stepThreeComponent.paymentForm;
    this.cdr.detectChanges();
  }

  ngDoCheck(): void {
    if (this.stepper?.selected.state === 'finalStep') {
      this.completed = true;
    }
  }
}
