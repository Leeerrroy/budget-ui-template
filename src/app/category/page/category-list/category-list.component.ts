import {Component, OnInit} from '@angular/core';
import {
  ModalController,
  ToastController,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonButton,
  IonContent,
  IonItem,
  IonLabel,
  IonFab,
  IonFabButton,
  IonList,
  IonIcon,
  IonNote
} from '@ionic/angular/standalone';
import {AngularFirestore} from '@angular/fire/compat/firestore';
import {AngularFireAuth} from '@angular/fire/compat/auth';
import CategoryModalComponent from '../../component/category-modal/category-modal.component';
import {CurrencyPipe, CommonModule, NgForOf} from '@angular/common';
import {CategoryService} from '../../service/category.service';
import {Category, CategoryUpsertDto} from '../../../shared/domain';

@Component({
  selector: 'app-category-list',
  templateUrl: './category-list.component.html',
  standalone: true,
  imports: [
    IonHeader,
    IonIcon,
    IonToolbar,
    IonButtons,
    IonButton,
    IonTitle,
    IonContent,
    IonItem,
    IonNote,
    IonLabel,
    IonFab,
    IonFabButton,
    IonList,
    CurrencyPipe,
    NgForOf
  ]
})
export default class CategoryListComponent implements OnInit {
  categories: Category[] = [];
  isLoading = false;

  constructor(
    private modalCtrl: ModalController,
    private categoryService: CategoryService,
    private toastCtrl: ToastController
  ) {
  }

  ngOnInit(): void {
    this.loadCategories();
  }

  private loadCategories(): void {
    this.isLoading = true;
    this.categoryService
      .getAllCategories({sort: 'name,asc'})
      .subscribe({
      next: categories => {
        this.categories = categories;
        this.isLoading = false;
      },
      error: async () => {
        const toast = await this.toastCtrl.create({
          message: 'Fehler beim Laden der Kategorien.',
          duration: 3000,
          color: 'danger'
        });
        toast.present();
        this.isLoading = false;
      }
    });
  }

  async openModal(): Promise<void> {
    const modal = await this.modalCtrl.create({
      component: CategoryModalComponent,
    });

    await modal.present();

    const {data, role} = await modal.onWillDismiss();
    if (role === 'save' && data) {
      this.saveCategory(data);
    }
  }

  private saveCategory(category: CategoryUpsertDto): void {
    this.categoryService.upsertCategory(category).subscribe({
      next: async () => {
        const toast = await this.toastCtrl.create({
          message: 'Kategorie erfolgreich gespeichert!',
          duration: 3000,
          color: 'success',
        });
        toast.present();
        this.loadCategories();
      },
      error: async () => {
        const toast = await this.toastCtrl.create({
          message: 'Fehler beim Speichern der Kategorie.',
          duration: 3000,
          color: 'danger',
        });
        toast.present();
      },
    });
  }

  deleteCategory(id: string): void {
    this.categoryService.deleteCategory(id).subscribe({
      next: () => this.loadCategories(),
      error: async () => {
        const toast = await this.toastCtrl.create({
          message: 'Fehler beim Löschen der Kategorie.',
          duration: 3000,
          color: 'danger',
        });
        toast.present();
      },
    });
  }
}
