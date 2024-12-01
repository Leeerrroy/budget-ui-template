import { Component, OnInit } from '@angular/core';
import {
  ModalController,
  IonHeader,
  IonToolbar,
  IonButtons,
  IonButton,
  IonIcon,
  IonTitle,
  IonContent,
  IonItem,
  IonInput,
  IonLabel,
  IonNote
} from '@ionic/angular/standalone';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormControl} from '@angular/forms';
import { addIcons } from 'ionicons';
import { add, close } from 'ionicons/icons';
import { NgIf } from '@angular/common';

@Component({
  selector: 'app-category-modal',
  templateUrl: './category-modal.component.html',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    IonHeader,
    IonToolbar,
    IonButtons,
    IonButton,
    IonIcon,
    IonTitle,
    IonContent,
    IonItem,
    IonInput,
    IonLabel,
    NgIf,
    IonNote
  ]
})
export default class CategoryModalComponent implements OnInit {
  categoryForm!: FormGroup; // Formulargruppe
  isLoading = false; // Ladezustand

  constructor(
    private modalCtrl: ModalController,
    private formBuilder: FormBuilder
  ) {
    addIcons({ add, close });
  }

  ngOnInit(): void {
    // Initialisiere das Formular
    this.categoryForm = this.formBuilder.group({
      name: ['', [Validators.required, Validators.minLength(2)]], // Kategoriename ist erforderlich
    });
  }
  get nameControl(): FormControl {
    return this.categoryForm.get('name') as FormControl;
  }
  save(): void {
    if (this.categoryForm.valid) {
      this.modalCtrl.dismiss(this.categoryForm.value, 'save');
    }
  }

  cancel(): void {
    this.modalCtrl.dismiss(null, 'cancel');
  }
}
