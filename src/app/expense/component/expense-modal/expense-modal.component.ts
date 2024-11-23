import { Component, OnInit, Input } from '@angular/core';
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
  IonSelect,
  IonSelectOption,
  IonNote,
  IonDatetime
} from '@ionic/angular/standalone';
import {FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormControl} from '@angular/forms';
import { addIcons } from 'ionicons';
import { add, calendar, cash, close, pricetag, save, trash } from 'ionicons/icons';
import {NgForOf} from "@angular/common";


@Component({
  selector: 'app-expense-modal',
  templateUrl: './expense-modal.component.html',
  standalone: true,
  imports: [
    // Form und Ionic-Komponenten
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
    IonSelect,
    IonSelectOption,
    IonNote,
    IonDatetime,
    NgForOf
  ]
})
export default class ExpenseModalComponent implements OnInit {
  @Input() isEditing: boolean = false; // Gibt an, ob wir bearbeiten
  @Input() expense: any = { name: '', category: '', amount: null, date: '' }; // Initialdaten

  expenseForm!: FormGroup; // Formulargruppe
  categories: string[] = ['Lebensmittel', 'Transport', 'Freizeit']; // Kategorienliste
  protected readonly FormControl = FormControl;

  constructor(
    private modalCtrl: ModalController,
    private formBuilder: FormBuilder
  ) {
    addIcons({ add, calendar, cash, close, pricetag, save, trash });
  }

  ngOnInit(): void {
    // Initialisiere das Formular
    this.expenseForm = this.formBuilder.group({
      name: [this.expense.name, [Validators.required]], // Name ist erforderlich
      category: [this.expense.category, [Validators.required]], // Kategorie ist erforderlich
      amount: [this.expense.amount, [Validators.required, Validators.min(0.01)]], // Betrag > 0
      date: [this.expense.date, [Validators.required]] // Datum ist erforderlich
    });
  }

  save(): void {
    if (this.expenseForm.valid) {
      this.modalCtrl.dismiss(this.expenseForm.value, 'save'); // Gibt die eingegebenen Daten zurück
    }
  }

  cancel(): void {
    this.modalCtrl.dismiss(null, 'cancel'); // Schließt das Modal ohne Aktion
  }

  delete(): void {
    this.modalCtrl.dismiss(null, 'delete'); // Löschen-Modus
  }

  get nameControl(): FormControl {
    return this.expenseForm.get('name') as FormControl;
  }

  get categoryControl(): FormControl {
    return this.expenseForm.get('category') as FormControl;
  }

  get amountControl(): FormControl {
    return this.expenseForm.get('amount') as FormControl;
  }

  get dateControl(): FormControl {
    return this.expenseForm.get('date') as FormControl;
  }

}
