import { Routes } from '@angular/router';
import { ShortenComponent } from './features/shorten/shorten.component';
import { DashboardComponent } from './features/dashboard/dashboard.component';
import { StatisticsComponent } from './features/statistics/statistics.component';

export const routes: Routes = [
  { path: '', component: ShortenComponent },
  { path: 'dashboard', component: DashboardComponent },
  { path: 'statistics/:id', component: StatisticsComponent },
  { path: '**', redirectTo: '' }
];
