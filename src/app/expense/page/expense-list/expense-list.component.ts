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
  ModalController, IonSearchbar
} from '@ionic/angular/standalone';
import { ReactiveFormsModule } from '@angular/forms';
import { addIcons } from 'ionicons';
import { add, alertCircleOutline, arrowBack, arrowForward, pricetag, search, swapVertical } from 'ionicons/icons';
import {CurrencyPipe, DatePipe, NgForOf, NgIf} from '@angular/common';
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
    // Ionic
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
  // Statische Expensenlist
  expenses : Expense[] = [
    { name: 'Einkauf', kategorie: 'Lebensmittel', amount: 45.95, date: '2024-11-15' },
    { name: 'Tankstelle', kategorie: 'Transport', amount: 60.0, date: '2024-11-16' },
    { name: 'Kino', kategorie: 'Freizeit', amount: 15.5, date: '2024-11-18' },
    { name: 'Kart fahren', kategorie: 'Freizeit', amount: 72.50, date: '2024-12-18' }
  ];
  filteredExpenses: Expense[] = [];

  private readonly modalCtrl = inject(ModalController);

  date = set(new Date(), { date: 1 });

  constructor() {
    // Add all used Ionic icons
    addIcons({ swapVertical, pricetag, search, alertCircleOutline, add, arrowBack, arrowForward });
  }

  addMonths(number: number): void {
    this.date = addMonths(this.date, number); // Ändere das Datum
    this.filterExpenses(); // Wende die Filterbedingungen (inkl. Monat) erneut an
  }
  filterText = ''; // Filter für die Eingabe
  filterCategory = ''; // Filter für die Kategorie

  ngOnInit() {
    this.filterExpenses();
  }

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

  onFilterTextChange(text: string | null | undefined) {
    this.filterText = text ?? ''; // Falls `null` oder `undefined`, wird ein leerer String verwendet
    this.filterExpenses();
  }

  onFilterCategoryChange(category: string) {
    this.filterCategory = category;
    this.filterExpenses();
  }
}


