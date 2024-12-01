import { Component, inject, OnInit } from '@angular/core';
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
  IonSearchbar,
  ToastController,
  IonItemDivider
} from '@ionic/angular/standalone';
import { ReactiveFormsModule } from '@angular/forms';
import { ExpenseService } from '../../service/expense.service';
import { Expense, ExpenseCriteria, ExpenseUpsertDto } from '../../../shared/domain';
import { addIcons } from 'ionicons';
import {add, alertCircleOutline, arrowBack, arrowForward, close, pricetag, search, swapVertical, save} from 'ionicons/icons';
import { CurrencyPipe, DatePipe, NgForOf, NgIf } from '@angular/common';
import ExpenseModalComponent from '../../component/expense-modal/expense-modal.component';
import { CategoryService } from '../../../category/service/category.service';


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
    IonItemDivider,
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
export default class ExpenseListComponent implements OnInit {
  expenses: Expense[] = [];
  filteredExpenses: Expense[] = [];
  filterText = '';
  filterCategory = '';
  currentDate = new Date(); // Für Monatsnavigation

  isLoading = false;

  constructor(
    private expenseService: ExpenseService,
    private modalCtrl: ModalController,
    private toastCtrl: ToastController,
    private categoryService: CategoryService
  ) {
  addIcons({ add, close, alertCircleOutline, arrowBack, arrowForward, pricetag, search, swapVertical, save });
}

  ngOnInit(): void {
    this.loadExpenses();
  }

  private async showToast(message: string, color: string): Promise<void> {
    const toast = await this.toastCtrl.create({
      message,
      duration: 3000,
      color,
    });
    await toast.present();
  }

  /**
   * Erstellt die Gruppierten Ausgaben
   */
  public groupedExpenses: { [date: string]: Expense[] } = {};

  private groupExpensesByDate(): void {
    this.groupedExpenses = this.expenses.reduce((groups, expense) => {
      const dateKey = new Date(expense.date).toLocaleDateString('de-CH', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      }); // Datum formatieren
      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }
      groups[dateKey].push(expense);
      return groups;
    }, {} as { [date: string]: Expense[] });
  }

  /**
   * Lädt die Ausgaben aus der Datenbank
   */
  private loadExpenses(): void {
    const yearMonth = `${this.currentDate.getFullYear()}${String(this.currentDate.getMonth() + 1).padStart(2, '0')}`;
    const criteria: ExpenseCriteria = {
      page: 0,
      size: 10,
      sort: 'date,desc',
      yearMonth,
    };

    this.isLoading = true;
    this.expenseService.getExpenses(criteria).subscribe({
      next: (response) => {
        this.expenses = response.content.map(expense => ({
          ...expense,
          category: {
            id: typeof expense.category === 'string' ? expense.category : expense.category?.id,
            name: expense.category?.name || 'Uncategorized',
            createdAt: expense.category?.createdAt || '',
            lastModifiedAt: expense.category?.lastModifiedAt || ''
          }
        }));
        this.groupExpensesByDate(); // Gruppieren nach Datum
        this.isLoading = false;
      },
      error: async () => {
        await this.showToast('Fehler beim Laden der Ausgaben.', 'danger');
        this.isLoading = false;
      },
    });
   }
  /**
   * Gibt die Key Objekte zurück
   */
  getKeys(obj: { [key: string]: any }): string[] {
    return Object.keys(obj);
  }

  /**
   * Gibt an ob im Monat überhaupt etwas gefunden wurde
   */
  isGroupedExpensesEmpty(): boolean {
    return Object.keys(this.groupedExpenses).length === 0;
  }

  /**
   * Monatsnavigation
   * @param step - Anzahl Monate vorwärts/rückwärts
   */
  addMonths(step: number): void {
    this.currentDate = addMonths(this.currentDate, step);
    this.loadExpenses();
  }

  /**
   * Öffnet das Modal für neue/bearbeitete Expense
   */
  async openExpenseModal(expense?: Expense): Promise<void> {
    const modal = await this.modalCtrl.create({
      component: ExpenseModalComponent,
      componentProps: { isEditing: !!expense, expense: expense || {} },
    });

    await modal.present();

    const { data, role } = await modal.onWillDismiss();
    if (role === 'save' && data) {
      this.saveExpense(data, expense);
    } else if (role === 'delete' && expense) {
      this.deleteExpense(expense.id!);
    }
  }

  private saveExpense(expense: ExpenseUpsertDto, existingExpense?: Expense): void {
    this.isLoading = true;

    // Prüfen, ob es sich um eine Aktualisierung handelt
    if (existingExpense?.id) {
      expense.id = existingExpense.id;
    }

    this.expenseService.upsertExpense(expense).subscribe({
      next: async () => {
        if (existingExpense) {
          const index = this.expenses.findIndex((e) => e.id === existingExpense.id);
          if (index > -1) this.expenses[index] = { ...existingExpense, ...expense };
        } else {
          this.expenses.push(expense as Expense);
        }
        this.filteredExpenses = [...this.expenses]; // Liste aktualisieren
        await this.showToast('Expense erfolgreich gespeichert.', 'success');
        this.loadExpenses(); // API erneut aufrufen
        this.isLoading = false;
      },
      error: async () => {
        await this.showToast('Fehler beim Speichern der Expense.', 'danger');
        this.isLoading = false;
      },
    });
  }

  private deleteExpense(id: string): void {
    this.isLoading = true;
    this.expenseService.deleteExpense(id).subscribe({
      next: async () => {
        this.expenses = this.expenses.filter((e) => e.id !== id);
        this.filteredExpenses = [...this.expenses];
        await this.showToast('Expense erfolgreich gelöscht.', 'success');
        this.isLoading = false;
      },
      error: async () => {
        await this.showToast('Fehler beim Löschen der Expense.', 'danger');
        this.isLoading = false;
      },
    });
  }


  onFilterTextChange(searchText: string): void {
    this.filterText = searchText ?? '';
    this.filterExpenses();
  }

  onFilterCategoryChange(category: string): void {
    this.filterCategory = category;
    this.filterExpenses();
  }

  private filterExpenses(): void {
    this.filteredExpenses = this.expenses.filter((expense) => {
      const matchesText = this.filterText
        ? expense.name.toLowerCase().includes(this.filterText.toLowerCase())
        : true;

      const matchesCategory = this.filterCategory
        ? expense.category?.name === this.filterCategory
        : true;

      return matchesText && matchesCategory;
    });
  }
}
