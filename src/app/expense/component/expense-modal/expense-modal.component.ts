import { Component, OnInit, Input } from '@angular/core';
import {
  IonProgressBar,
  ModalController,
  IonHeader,
  IonToolbar,
  IonButtons,
  IonButton,
  IonIcon,
  IonFab,
  IonFabButton,
  IonTitle,
  IonContent,
  IonItem,
  IonInput,
  IonLabel,
  IonSelect,
  IonSelectOption,
  IonNote,
  IonDatetime,
  ToastController
} from '@ionic/angular/standalone';
import { FormGroup, Validators, FormControl, ReactiveFormsModule, FormBuilder } from '@angular/forms';
import { addIcons } from 'ionicons';
import { add, calendar, cash, close, pricetag, save, trash, text } from 'ionicons/icons';
import { NgForOf, NgIf } from '@angular/common';
import { ExpenseService } from '../../service/expense.service';
import { CategoryService } from '../../../category/service/category.service';
import { Category } from '../../../shared/domain';
import CategoryModalComponent from '../../../category/component/category-modal/category-modal.component';

@Component({
  selector: 'app-expense-modal',
  templateUrl: './expense-modal.component.html',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    IonHeader,
    IonFabButton,
    IonFab,
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
    IonProgressBar,
    NgForOf,
    NgIf
  ]
})
export default class ExpenseModalComponent implements OnInit {
  @Input() isEditing = false;
  @Input() expense: any = { name: '', category: '', amount: null, date: '' };

  expenseForm!: FormGroup;
  categories: Category[] = [];
  isLoading = false;

  constructor(
    private modalCtrl: ModalController,
    private formBuilder: FormBuilder,
    private categoryService: CategoryService,
    private expenseService: ExpenseService,
    private toastCtrl: ToastController
  ) {
    addIcons({ add, calendar, cash, close, pricetag, save, trash, text });
  }
  ngOnInit(): void {
    this.expenseForm = this.formBuilder.group({
      id: [this.expense.id || null],
      name: [this.expense.name, [Validators.required]],
      category: [this.expense.category, []],
      amount: [this.expense.amount, [Validators.required, Validators.min(0.01)]],
      date: [this.expense.date, [Validators.required]]
    });
    console.log('ExpenseService instance:', this.expenseService);
    this.loadCategories();
  }

  private loadCategories(): void {
    this.categoryService.getAllCategories({ sort: 'name,asc' }).subscribe({
      next: categories => (this.categories = categories),
      error: err => console.error('Error loading categories:', err)
    });
  }

  save(): void {
    if (this.expenseForm.valid) {
      this.modalCtrl.dismiss(this.expenseForm.value, 'save');
    }
  }

  cancel(): void {
    this.modalCtrl.dismiss(null, 'cancel');
  }

  async delete(): Promise<void> {
    this.modalCtrl.dismiss(null, 'delete');
  }

  //Neue Kategorie hinzufügen im Modal
  async openNewCategoryModal(): Promise<void> {
    const modal = await this.modalCtrl.create({
      component: CategoryModalComponent
    });

    await modal.present();

    const { data, role } = await modal.onWillDismiss();

    if (role === 'save' && data) {
      this.isLoading = true; // Ladezustand anzeigen
      this.categoryService.upsertCategory(data).subscribe({
        next: response => {
          // Neue Kategorie lokal hinzufügen und auswählen
          this.categories.push(data);
          this.categoryControl.setValue(data.id);
          this.isLoading = false; // Ladezustand beenden
        },
        error: err => {
          console.error('Fehler beim Speichern der Kategorie:', err);
          this.isLoading = false; // Ladezustand beenden
        }
      });
    }
  }

  // Getter für FormControls
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
