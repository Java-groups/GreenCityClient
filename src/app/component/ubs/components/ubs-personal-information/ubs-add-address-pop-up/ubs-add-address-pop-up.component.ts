import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';

@Component({
  selector: 'app-ubs-add-address-pop-up',
  templateUrl: './ubs-add-address-pop-up.component.html',
  styleUrls: ['./ubs-add-address-pop-up.component.scss']
})
export class UBSAddAddressPopUpComponent implements OnInit {
  addAddressForm: FormGroup;
  region = '';
  districtDisabled = true;
  nextDisabled = true;
  streetPattern = /^[A-Za-zА-Яа-яїієё0-9\'\,\-\ \\]+$/;
  houseCorpusPattern = /^[A-Za-zА-Яа-яїієё0-9]+$/;
  entranceNumberPattern = /^-?(0|[1-9]\d*)?$/;

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<UBSAddAddressPopUpComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any) { }

  get district() {
    return this.addAddressForm.get('district');
  }

  get street() {
    return this.addAddressForm.get('street');
  }

  get houseCorpus() {
    return this.addAddressForm.get('houseCorpus');
  }

  ngOnInit() {
    this.addAddressForm = this.fb.group({
      city: ['Київ', Validators.required],
      district: ['', Validators.required],
      street: ['', [
        Validators.required,
        Validators.minLength(3),
        Validators.maxLength(40),
        Validators.pattern(this.streetPattern)
      ]],
      houseNumber: ['', Validators.required],
      houseCorpus: ['', [
        Validators.maxLength(2),
        Validators.pattern(this.houseCorpusPattern)
      ]],
      entranceNumber: ['', [
        Validators.maxLength(2),
        Validators.pattern(this.entranceNumberPattern)
      ]],
      longitude: ['', Validators.required],
      latitude: ['', Validators.required]
    });
  }

  onLocationSelected(event): void {
    this.addAddressForm.get('longitude').setValue(event.longitude);
    this.addAddressForm.get('latitude').setValue(event.latitude);
  }

  onAutocompleteSelected(event): void {
    const streetName = event.name;
    this.addAddressForm.get('street').setValue(streetName);
    this.region = event.address_components[2].long_name.split(' ')[1] === 'район'
      ? event.address_components[2].long_name.split(' ')[0] : null;
    this.addAddressForm.get('district').setValue(this.region);
    this.nextDisabled = false;
    this.districtDisabled = event.address_components[2].long_name.split(' ')[1] === 'район' ? true : false;
  }

  onDistrictSelected(event): void {
    this.region = event.address_components[0].long_name.split(' ')[0];
    this.addAddressForm.get('district').setValue(this.region);
    this.districtDisabled = true;
    this.nextDisabled = false;
  }

  onChange(): void {
    this.region = null;
    this.addAddressForm.get('district').setValue(this.region);
    this.districtDisabled = false;
    this.nextDisabled = true;
  }

  onNoClick(): void {
    this.dialogRef.close();
  }
}