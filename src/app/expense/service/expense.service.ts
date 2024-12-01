import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Expense, ExpenseCriteria, ExpenseUpsertDto, Page } from '../../shared/domain';

@Injectable({ providedIn: 'root' })
export class ExpenseService {
  private readonly httpClient = inject(HttpClient);

  private readonly apiUrl = `${environment.backendUrl}/expenses`;

  // Read

  getExpenses = (pagingCriteria: ExpenseCriteria): Observable<Page<Expense>> =>
    this.httpClient.get<Page<Expense>>(this.apiUrl, {
      params: new HttpParams({ fromObject: { ...pagingCriteria } })
    });

  getAllExpenses = (): Observable<Expense[]> => this.httpClient.get<Expense[]>(`${this.apiUrl}/all`);

  // Create & Update

  upsertExpense = (expense: ExpenseUpsertDto): Observable<void> => this.httpClient.put<void>(this.apiUrl, expense);

  // Delete

  deleteExpense = (id: string): Observable<void> => this.httpClient.delete<void>(`${this.apiUrl}/${id}`);
}
