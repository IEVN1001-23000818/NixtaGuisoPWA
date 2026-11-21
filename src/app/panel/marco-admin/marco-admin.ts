import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { BarraSuperior } from '../../compartidos/barra-superior/barra-superior';
import { MenuLateral } from '../../compartidos/menu-lateral/menu-lateral';

/**
 * Marco de las pantallas avanzadas del panel (indicadores, reportes, pedidos,
 * rutas, repartidores, producción y ficha del cliente), con la barra superior
 * y el menú lateral del diseño del equipo.
 */
@Component({
  selector: 'app-marco-admin',
  imports: [RouterOutlet, BarraSuperior, MenuLateral],
  template: `
    <div class="min-h-screen bg-crema pb-16">
      <app-barra-superior (abrirMenu)="menuAbierto = true" />
      <main class="max-w-6xl mx-auto px-4 lg:px-8 pt-6 lg:pt-10"><router-outlet /></main>
      <app-menu-lateral [abierto]="menuAbierto" (cerrar)="menuAbierto = false" />
    </div>`
})
export class MarcoAdmin {
  menuAbierto = false;
}
