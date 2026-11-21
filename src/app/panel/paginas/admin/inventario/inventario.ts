import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CurrencyPipe, DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { AdminService } from '../../../servicios/admin.service';
import { AvisosService } from '../../../servicios/avisos.service';
import { Compra, Insumo, Merma, Produccion, ProductoAdmin, Receta } from '../../../interfaces/admin';

type Pestana = 'stock' | 'compras' | 'produccion' | 'mermas';

@Component({
  selector: 'app-inventario',
  imports: [CurrencyPipe, DecimalPipe, FormsModule],
  templateUrl: './inventario.html'
})
export class Inventario implements OnInit {
  private admin = inject(AdminService);
  private avisos = inject(AvisosService);

  pestana = signal<Pestana>('stock');
  insumos = signal<Insumo[]>([]);
  compras = signal<Compra[]>([]);
  recetas = signal<Receta[]>([]);
  producciones = signal<Produccion[]>([]);
  mermas = signal<Merma[]>([]);
  costoMermas = signal(0);
  productos = signal<ProductoAdmin[]>([]);
  filtroStock = signal<'todos' | 'optimo' | 'por_surtir'>('todos');

  insumosFiltrados = computed(() => this.filtroStock() === 'todos' ? this.insumos() : this.insumos().filter(i => i.estado === this.filtroStock()));
  porSurtir = computed(() => this.insumos().filter(i => i.estado === 'por_surtir').length);

  nuevoInsumo = { nombre: '', unidad: 'kg', stock_minimo: 0, costo_unitario: null as number | null };
  compra = { id_insumo: 0, cantidad: null as number | null, costo_total: null as number | null, proveedor: '' };
  produccion = { id_receta: 0, num_lotes: 1, notas: '' };
  merma = { tipo: 'insumo' as 'insumo' | 'producto', id: 0, cantidad: null as number | null, motivo: '' };

  ngOnInit(): void { this.cargarTodo(); }

  cargarTodo(): void {
    this.admin.insumos().subscribe(r => this.insumos.set(r.insumos));
    this.admin.compras().subscribe(r => this.compras.set(r.compras));
    this.admin.recetas().subscribe(r => this.recetas.set(r.recetas));
    this.admin.producciones().subscribe(r => this.producciones.set(r.producciones));
    this.admin.mermas().subscribe(r => { this.mermas.set(r.mermas); this.costoMermas.set(r.costo_total_estimado); });
    this.admin.productos().subscribe(r => this.productos.set(r.productos.filter(p => !p.es_paquete)));
  }

  private resultado(mensaje = 'Guardado') {
    return {
      next: (r: { mensaje?: string }) => { this.avisos.mostrar(r.mensaje ?? mensaje); this.cargarTodo(); },
      error: (err: { error?: { mensaje?: string } }) => this.avisos.error(err.error?.mensaje || 'No se pudo guardar')
    };
  }

  crearInsumo(): void {
    this.admin.crearInsumo(this.nuevoInsumo as Partial<Insumo>).subscribe(this.resultado());
    this.nuevoInsumo = { nombre: '', unidad: 'kg', stock_minimo: 0, costo_unitario: null };
  }

  cambiarMinimo(i: Insumo, valor: string): void {
    const minimo = Number(valor);
    if (isNaN(minimo) || minimo === i.stock_minimo) return;
    this.admin.editarInsumo(i.id_insumo, { nombre: i.nombre, stock_minimo: minimo, costo_unitario: i.costo_unitario }).subscribe(this.resultado('Mínimo actualizado'));
  }

  registrarCompra(): void {
    this.admin.registrarCompra({ ...this.compra, cantidad: Number(this.compra.cantidad), costo_total: Number(this.compra.costo_total) }).subscribe(this.resultado());
    this.compra = { id_insumo: this.compra.id_insumo, cantidad: null, costo_total: null, proveedor: '' };
  }

  registrarProduccion(): void {
    this.admin.registrarProduccion(this.produccion).subscribe(this.resultado());
    this.produccion = { ...this.produccion, num_lotes: 1, notas: '' };
  }

  registrarMerma(): void {
    const cuerpo = this.merma.tipo === 'insumo'
      ? { id_insumo: this.merma.id, cantidad: Number(this.merma.cantidad), motivo: this.merma.motivo }
      : { id_producto: this.merma.id, cantidad: Number(this.merma.cantidad), motivo: this.merma.motivo };
    this.admin.registrarMerma(cuerpo).subscribe(this.resultado());
    this.merma = { ...this.merma, cantidad: null, motivo: '' };
  }

  recetaElegida = computed(() => this.recetas().find(r => r.id_receta === Number(this.produccion.id_receta)) ?? null);
}
