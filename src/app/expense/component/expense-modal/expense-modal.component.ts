import { Component, OnInit, Input } from '@angular/core';
import {
  IonProgressBar,
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
  IonDatetime,
} from '@ionic/angular/standalone';
import { FormGroup, Validators, FormControl, ReactiveFormsModule, FormBuilder } from '@angular/forms';
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
    IonProgressBar,
    NgForOf,
    NgIf,
  ],
})
export default class ExpenseModalComponent implements OnInit {
  @Input() isEditing = false;
  @Input() expense: any = { name: '', category: '', amount: null, date: '' };

  expenseForm!: FormGroup;
  categories: { id: string; name: string }[] = [];
  isLoading = false;
  userId: string | null = null;

  constructor(
    private modalCtrl: ModalController,
    private formBuilder: FormBuilder,
    private firestore: AngularFirestore,
    private afAuth: AngularFireAuth
  ) {
    addIcons({ add, calendar, cash, close, pricetag, save, trash });
  }

  ngOnInit(): void {
    this.expenseForm = this.formBuilder.group({
      name: [this.expense.name, [Validators.required]],
      category: [this.expense.category, []],
      amount: [this.expense.amount, [Validators.required, Validators.min(0.01)]],
      date: [this.expense.date || formatISO(new Date()), [Validators.required]],
    });

    this.afAuth.authState.subscribe((user) => {
      this.userId = user?.uid || null;
    });
  }

  async save(): Promise<void> {
    if (this.expenseForm.invalid || !this.userId) return;

    this.isLoading = true;
    const expenseData = {
      ...this.expenseForm.value,
      userId: this.userId,
      date: formatISO(parseISO(this.expenseForm.value.date), { representation: 'date' }),
    };

    try {
      if (this.isEditing && this.expense.id) {
        await this.firestore.collection('expenses').doc(this.expense.id).update(expenseData);
      } else {
        await this.firestore.collection('expenses').add(expenseData);
      }

      this.modalCtrl.dismiss(expenseData, 'save');
    } catch (error) {
      console.error('Error saving expense:', error);
    } finally {
      this.isLoading = false;
    }
  }

  cancel(): void {
    this.modalCtrl.dismiss(null, 'cancel');
  }

  async delete(): Promise<void> {
    if (!this.isEditing || !this.expense.id) return;

    this.isLoading = true;
    try {
      await this.firestore.collection('expenses').doc(this.expense.id).delete();
      this.modalCtrl.dismiss(null, 'delete');
    } catch (error) {
      console.error('Error deleting expense:', error);
    } finally {
      this.isLoading = false;
    }
  }

  async openNewCategoryModal(): Promise<void> {
    const modal = await this.modalCtrl.create({
      component: CategoryModalComponent
    });

    await modal.present();

    const { data, role } = await modal.onWillDismiss();

    if (role === 'save' && data) {
      this.categories.push(data);
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
