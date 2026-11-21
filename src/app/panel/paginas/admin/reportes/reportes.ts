import { Component, OnInit, inject, signal } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { AdminService } from '../../../servicios/admin.service';
import { AvisosService } from '../../../servicios/avisos.service';
import { Gasto, Meta, Metrica, Reporte } from '../../../interfaces/admin';

@Component({
  selector: 'app-reportes',
  imports: [CurrencyPipe, FormsModule],
  templateUrl: './reportes.html'
})
export class Reportes implements OnInit {
  private admin = inject(AdminService);
  private avisos = inject(AvisosService);

  mes = new Date().toISOString().slice(0, 7);
  reporte = signal<Reporte | null>(null);
  gastos = signal<Gasto[]>([]);
  totalGastos = signal(0);
  metas = signal<Meta[]>([]);
  nuevoGasto = { categoria: 'publicidad_b2c', concepto: '', monto: null as number | null, fecha: new Date().toISOString().slice(0, 10) };
  categorias = [
    ['infraestructura', 'Infraestructura digital'], ['empaque', 'Empaque biodegradable'], ['publicidad_b2c', 'Publicidad digital B2C'],
    ['muestras_b2b', 'Muestras B2B'], ['lead_ads_b2b', 'Lead Ads B2B'], ['referidos_cupones', 'Referidos y cupones QR'], ['bono_primer_pedido', 'Bono de primer pedido']
  ];

  ngOnInit(): void { this.cargar(); this.admin.metas().subscribe(r => this.metas.set(r.metas)); }

  cargar(): void {
    this.admin.reportes(this.mes).subscribe(r => this.reporte.set(r));
    this.admin.gastos(this.mes).subscribe(r => { this.gastos.set(r.gastos); this.totalGastos.set(r.total); });
  }

  valor(m: Metrica): string {
    if (m.valor === null) return 'Sin datos';
    if (m.unidad === 'MXN') return '$' + m.valor.toLocaleString('es-MX', { maximumFractionDigits: 2 });
    if (m.unidad === '%') return m.valor + ' %';
    return m.valor.toLocaleString('es-MX', { maximumFractionDigits: 2 }) + ' ' + m.unidad;
  }

  agregarGasto(): void {
    this.admin.crearGasto(this.nuevoGasto as Partial<Gasto>).subscribe({
      next: () => { this.avisos.mostrar('Gasto registrado'); this.nuevoGasto.concepto = ''; this.nuevoGasto.monto = null; this.cargar(); },
      error: err => this.avisos.error(err.error?.mensaje || 'No se pudo registrar')
    });
  }

  eliminarGasto(g: Gasto): void {
    if (!confirm(`¿Eliminar "${g.concepto}"?`)) return;
    this.admin.eliminarGasto(g.id_gasto).subscribe(() => { this.avisos.mostrar('Gasto eliminado'); this.cargar(); });
  }

  guardarMeta(m: Meta, valor: string): void {
    const numero = Number(valor);
    if (!numero || numero === m.valor_meta) return;
    this.admin.editarMeta(m.id_meta, numero).subscribe({
      next: () => { this.avisos.mostrar('Meta actualizada'); m.valor_meta = numero; this.cargar(); },
      error: err => this.avisos.error(err.error?.mensaje || 'No se pudo actualizar')
    });
  }

  nombreCategoria(c: string): string { return this.categorias.find(x => x[0] === c)?.[1] ?? c; }
}
