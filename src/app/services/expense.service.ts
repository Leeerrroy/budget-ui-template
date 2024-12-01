import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {Expense, ExpenseUpsertDto, ExpenseCriteria, Page, Category} from '../shared/domain';

@Injectable({
  providedIn: 'root',
})
export class ExpenseService {
  private readonly baseUrl = 'https://budget-service.onrender.com/expenses';

  constructor(private http: HttpClient) {
  }

  /**
   * Get Expenses with optional filtering and paging
   * @param criteria - ExpenseCriteria for filtering, sorting, and paging
   * @returns Observable<Page<Expense>> - Paginated list of expenses
   */
  getExpenses(criteria: ExpenseCriteria): Observable<Page<Expense>> {
    return this.http.get<Page<Expense>>(this.baseUrl, {params: criteria as any});
  }

  /**
   * Create or update an expense
   * @param expense - ExpenseUpsertDto containing expense data
   * @returns Observable<Expense> - The created or updated expense
   */
  upsertExpense(expense: ExpenseUpsertDto): Observable<Expense> {
    const url = expense.id ? `${this.baseUrl}/${expense.id}` : this.baseUrl;
    return expense.id
      ? this.http.put<Expense>(url, expense) // Update an existing expense
      : this.http.post<Expense>(url, expense); // Create a new expense
  }

  /**
   * Delete an expense by ID
   * @param id - The ID of the expense to delete
   * @returns Observable<void> - Confirmation of deletion
   */
  deleteExpense(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
