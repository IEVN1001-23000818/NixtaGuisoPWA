import { Component, ElementRef, OnDestroy, OnInit, inject, signal, viewChild } from '@angular/core';
import { CurrencyPipe, DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Chart, registerables } from 'chart.js';

import { AdminService } from '../../../servicios/admin.service';
import { AuthRolService } from '../../../../servicios/auth-rol.service';
import { Dashboard } from '../../../interfaces/admin';

Chart.register(...registerables);

@Component({
  selector: 'app-panel',
  imports: [CurrencyPipe, DecimalPipe, FormsModule, RouterLink],
  templateUrl: './panel.html'
})
export class Panel implements OnInit, OnDestroy {
  private admin = inject(AdminService);
  private auth = inject(AuthRolService);
  primerNombre = () => this.auth.usuario()?.nombre.split(' ')[0] ?? '';

  datos = signal<Dashboard | null>(null);
  fecha = new Date().toISOString().slice(0, 10);
  private lienzo = viewChild<ElementRef<HTMLCanvasElement>>('grafica');
  private grafica?: Chart;

  ngOnInit(): void { this.cargar(); }

  cargar(): void {
    this.admin.dashboard(this.fecha).subscribe(r => {
      this.datos.set(r);
      setTimeout(() => this.dibujar(r), 0);   // espera a que el <canvas> exista en pantalla
    });
  }

  private dibujar(d: Dashboard): void {
    const canvas = this.lienzo()?.nativeElement;
    if (!canvas) return;
    this.grafica?.destroy();
    this.grafica = new Chart(canvas, {
      type: 'bar',
      data: {
        labels: d.grafica.etiquetas,
        datasets: [
          { label: 'Negocios (B2B)', data: d.grafica.b2b, backgroundColor: '#10733B', borderRadius: 8 },
          { label: 'Hogares (B2C)', data: d.grafica.b2c, backgroundColor: '#F5AF41', borderRadius: 8 }
        ]
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: { legend: { position: 'bottom' } },
        scales: { x: { stacked: true }, y: { stacked: true, ticks: { callback: v => '$' + v } } }
      }
    });
  }

  ngOnDestroy(): void { this.grafica?.destroy(); }
}
