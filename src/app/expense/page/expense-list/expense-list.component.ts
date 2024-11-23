import { Component, inject } from '@angular/core';
import { addMonths, set } from 'date-fns';
import {
  IonButtons,
  IonButton,
  IonBadge,
  IonCol,
  IonContent,
  IonFab,
  IonFabButton,
  IonGrid,
  IonHeader,
  IonIcon,
  IonInfiniteScroll,
  IonInfiniteScrollContent,
  IonInput,
  IonItem,
  IonLabel,
  IonList,
  IonMenuButton,
  IonProgressBar,
  IonRefresher,
  IonRefresherContent,
  IonRow,
  IonSelect,
  IonSelectOption,
  IonSkeletonText,
  IonTitle,
  IonToolbar,
  ModalController,
  IonSearchbar
} from '@ionic/angular/standalone';
import { ReactiveFormsModule } from '@angular/forms';
import { addIcons } from 'ionicons';
import { add, alertCircleOutline, arrowBack, arrowForward, pricetag, search, swapVertical } from 'ionicons/icons';
import { CurrencyPipe, DatePipe, NgForOf, NgIf } from '@angular/common';
import ExpenseModalComponent from '../../component/expense-modal/expense-modal.component';

interface Expense {
  name: string;
  kategorie: string;
  amount: number;
  date: string;
}

@Component({
  selector: 'app-expense-list',
  templateUrl: './expense-list.component.html',
  standalone: true,
  imports: [
    CurrencyPipe,
    DatePipe,
    ReactiveFormsModule,
    IonButton,
    IonBadge,
    IonHeader,
    IonToolbar,
    IonButtons,
    IonMenuButton,
    IonTitle,
    IonProgressBar,
    IonContent,
    IonRefresher,
    IonRefresherContent,
    IonGrid,
    IonRow,
    IonCol,
    IonList,
    IonItem,
    IonIcon,
    IonSelect,
    IonSelectOption,
    IonInput,
    IonLabel,
    IonSkeletonText,
    IonInfiniteScroll,
    IonInfiniteScrollContent,
    IonFab,
    IonFabButton,
    NgIf,
    NgForOf,
    IonSearchbar
  ]
})
export default class ExpenseListComponent {
  expenses: Expense[] = [
    { name: 'Einkauf', kategorie: 'Lebensmittel', amount: 45.95, date: '2024-11-15' },
    { name: 'Tankstelle', kategorie: 'Transport', amount: 60.0, date: '2024-11-16' },
    { name: 'Kino', kategorie: 'Freizeit', amount: 15.5, date: '2024-11-18' },
    { name: 'Kart fahren', kategorie: 'Freizeit', amount: 72.5, date: '2024-12-18' }
  ];
  filteredExpenses: Expense[] = [];

  private readonly modalCtrl = inject(ModalController);

  date = set(new Date(), { date: 1 });

  constructor() {
    addIcons({ swapVertical, pricetag, search, alertCircleOutline, add, arrowBack, arrowForward });
  }

  // Modal für neue oder bearbeitete Expense öffnen
  async openExpenseModal(expense?: Expense) {
    const modal = await this.modalCtrl.create({
      component: ExpenseModalComponent,
      componentProps: {
        isEditing: !!expense, // True, wenn wir bearbeiten
        expense: expense ? { ...expense } : { name: '', kategorie: '', amount: 0, date: new Date().toISOString() }
      }
    });
    await modal.present();

    const { data, role } = await modal.onWillDismiss();

    if (role === 'save' && data) {
      if (expense) {
        // Bestehende Expense bearbeiten
        const index = this.expenses.indexOf(expense);
        if (index > -1) this.expenses[index] = data;
      } else {
        // Neue Expense hinzufügen
        this.expenses.push(data);
      }
      this.filterExpenses(); // Filter aktualisieren
    } else if (role === 'delete' && expense) {
      // Expense löschen
      const index = this.expenses.indexOf(expense);
      if (index > -1) this.expenses.splice(index, 1);
      this.filterExpenses();
    }
  }

  // Navigation für Monate
  addMonths(number: number): void {
    this.date = addMonths(this.date, number);
    this.filterExpenses();
  }

  filterText = '';
  filterCategory = '';

  ngOnInit() {
    this.filterExpenses();
  }

  // Filterlogik
  filterExpenses() {
    const selectedMonth = this.date.getMonth();
    const selectedYear = this.date.getFullYear();

    this.filteredExpenses = this.expenses.filter(expense => {
      const expenseDate = new Date(expense.date);

      const matchesDate =
        expenseDate.getMonth() === selectedMonth &&
        expenseDate.getFullYear() === selectedYear;

      const matchesText = this.filterText
        ? expense.name.toLowerCase().includes(this.filterText.toLowerCase())
        : true;

      const matchesCategory = this.filterCategory
        ? expense.kategorie === this.filterCategory
        : true;

      return matchesDate && matchesText && matchesCategory;
    });
  }

  // Filtertext ändern
  onFilterTextChange(text: string | null | undefined) {
    this.filterText = text ?? '';
    this.filterExpenses();
  }

  // Kategorie ändern
  onFilterCategoryChange(category: string) {
    this.filterCategory = category;
    this.filterExpenses();
  }

  protected readonly ExpenseModalComponent = ExpenseModalComponent;
}
