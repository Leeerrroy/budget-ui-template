import { Component, OnInit, Input } from '@angular/core';
import {
  IonProgressBar, // Import hinzufügen
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
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormControl, FormsModule} from '@angular/forms';
import { addIcons } from 'ionicons';
import { add, calendar, cash, close, pricetag, save, trash } from 'ionicons/icons';
import { NgForOf, NgIf } from '@angular/common';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { formatISO, parseISO } from 'date-fns';
import CategoryModalComponent from '../../../category/component/category-modal/category-modal.component';

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
    IonProgressBar, // Hinzugefügt
    NgForOf,
    NgIf,
    FormsModule
  ]
})
export default class ExpenseModalComponent implements OnInit {
  @Input() isEditing: boolean = false; // Gibt an, ob wir bearbeiten
  @Input() expense: any = { name: '', category: '', amount: null, date: '' }; // Initialdaten

  expenseForm!: FormGroup; // Formulargruppe
  categories: { id: string; name: string }[] = [
    { id: '1', name: 'Lebensmittel' },
    { id: '2', name: 'Transport' },
    { id: '3', name: 'Freizeit' }
  ];
  isLoading = false; // Ladezustand
  userId: string | null = null; // Aktuelle Benutzer-ID
  protected readonly FormControl = FormControl;

  constructor(
    private modalCtrl: ModalController,
    private formBuilder: FormBuilder,
    private firestore: AngularFirestore,
    private afAuth: AngularFireAuth
  ) {
    addIcons({ add, calendar, cash, close, pricetag, save, trash });
  }

  ngOnInit(): void {
    // Initialisiere das Formular
    this.expenseForm = this.formBuilder.group({
      name: [this.expense.name, [Validators.required]], // Name ist erforderlich
      category: [this.expense.category, []], // Kategorie ist optional
      amount: [this.expense.amount, [Validators.required, Validators.min(0.01)]], // Betrag > 0
      date: [this.expense.date || formatISO(new Date()), [Validators.required]] // Datum ist erforderlich
    });

    // Benutzer-ID laden
    this.afAuth.authState.subscribe((user) => {
      this.userId = user?.uid || null;
    });
  }

  // Speichern der Expense
  async save(): Promise<void> {
    if (this.expenseForm.invalid || !this.userId) return;

    this.isLoading = true;
    const expenseData = {
      ...this.expenseForm.value,
      userId: this.userId,
      date: formatISO(parseISO(this.expenseForm.value.date), { representation: 'date' }),
    };

    try {
      // Speichere die Expense in Firestore
      if (this.isEditing && this.expense.id) {
        // Aktualisieren
        await this.firestore.collection('expenses').doc(this.expense.id).update(expenseData);
      } else {
        // Neue Expense hinzufügen
        await this.firestore.collection('expenses').add(expenseData);
      }

      this.modalCtrl.dismiss(expenseData, 'save'); // Schließt das Modal und gibt die Daten zurück
    } catch (error) {
      console.error('Fehler beim Speichern der Expense:', error);
    } finally {
      this.isLoading = false;
    }
  }

  // Abbrechen
  cancel(): void {
    this.modalCtrl.dismiss(null, 'cancel'); // Schließt das Modal ohne Aktion
  }

  // Löschen
  async delete(): Promise<void> {
    if (!this.isEditing || !this.expense.id) return;

    this.isLoading = true;
    try {
      await this.firestore.collection('expenses').doc(this.expense.id).delete();
      this.modalCtrl.dismiss(null, 'delete');
    } catch (error) {
      console.error('Fehler beim Löschen der Expense:', error);
    } finally {
      this.isLoading = false;
    }
  }

  async openNewCategoryModal(): Promise<void> {
    const modal = await this.modalCtrl.create({
      component: CategoryModalComponent // Dein Kategorie-Modal
    });

    await modal.present();

    const { data, role } = await modal.onWillDismiss();

    if (role === 'save' && data) {
      // Neue Kategorie in die Liste hinzufügen
      this.categories.push(data);

      // Setze die neue Kategorie als ausgewählt
      this.categoryControl.setValue(data.id);
    }
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
