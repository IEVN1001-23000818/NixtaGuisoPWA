import { Routes } from '@angular/router';

import { adminGuard, clienteGuard } from './guards/acceso.guard';
import { MarcoAdmin } from './panel/marco-admin/marco-admin';

import { Bienvenida } from './modulos/autenticacion/bienvenida/bienvenida';
import { InicioSesion } from './modulos/autenticacion/inicio-sesion/inicio-sesion';
import { Registro } from './modulos/autenticacion/registro/registro';
import { RecuperarContrasena } from './modulos/autenticacion/recuperar-contrasena/recuperar-contrasena';

import { Inicio } from './modulos/catalogo/inicio/inicio';
import { Buscador } from './modulos/catalogo/buscador/buscador';
import { DetalleProducto } from './modulos/catalogo/detalle-producto/detalle-producto';

import { Carrito } from './modulos/checkout/carrito/carrito';
import { DireccionEntrega } from './modulos/checkout/direccion-entrega/direccion-entrega';
import { MetodoPago } from './modulos/checkout/metodo-pago/metodo-pago';
import { Confirmacion } from './modulos/checkout/confirmacion/confirmacion';

import { PerfilUsuario } from './modulos/perfil/perfil-usuario/perfil-usuario';
import { HistorialPedidos } from './modulos/perfil/historial-pedidos/historial-pedidos';

import { CalendarioAgendamiento } from './modulos/pedidos-programados/calendario-agendamiento/calendario-agendamiento';
import { FormularioEspecial } from './modulos/pedidos-programados/formulario-especial/formulario-especial';
import { CotizacionesB2b } from './modulos/pedidos-programados/cotizaciones-b2b/cotizaciones-b2b';

import { PanelOperativo } from './modulos/administracion/panel-operativo/panel-operativo';
import { ListadoMenu } from './modulos/gestion-menu/listado-menu/listado-menu';
import { FormularioProducto } from './modulos/gestion-menu/formulario-producto/formulario-producto';
import { ControlInventario } from './modulos/inventario/control-inventario/control-inventario';
import { DirectorioClientes } from './modulos/crm/directorio-clientes/directorio-clientes';
import { MapaDespacho } from './modulos/logistica/mapa-despacho/mapa-despacho';
import { RastreoPedido } from './modulos/logistica/rastreo-pedido/rastreo-pedido';

export const routes: Routes = [
  { path: '', component: Bienvenida },
  { path: 'iniciar-sesion', component: InicioSesion },
  { path: 'registro', component: Registro },
  { path: 'recuperar-contrasena', component: RecuperarContrasena },

  { path: 'inicio', component: Inicio },
  { path: 'buscador', component: Buscador },
  { path: 'producto/:id', component: DetalleProducto },

  { path: 'carrito', component: Carrito, canActivate: [clienteGuard] },
  { path: 'checkout/entrega', component: DireccionEntrega, canActivate: [clienteGuard] },
  { path: 'checkout/pago', component: MetodoPago, canActivate: [clienteGuard] },
  { path: 'checkout/confirmacion', component: Confirmacion, canActivate: [clienteGuard] },

  { path: 'perfil', component: PerfilUsuario, canActivate: [clienteGuard] },
  { path: 'historial-pedidos', component: HistorialPedidos, canActivate: [clienteGuard] },

  { path: 'programados', component: CalendarioAgendamiento, canActivate: [clienteGuard] },
  { path: 'programados/nuevo', component: FormularioEspecial, canActivate: [clienteGuard] },
  { path: 'cotizaciones-b2b', component: CotizacionesB2b, canActivate: [clienteGuard] },

  { path: 'admin/panel', component: PanelOperativo, canActivate: [adminGuard] },
  { path: 'admin/menu', component: ListadoMenu, canActivate: [adminGuard] },
  { path: 'admin/menu/nuevo', component: FormularioProducto, canActivate: [adminGuard] },
  { path: 'admin/menu/editar/:id', component: FormularioProducto, canActivate: [adminGuard] },
  { path: 'admin/inventario', component: ControlInventario, canActivate: [adminGuard] },
  { path: 'admin/crm', component: DirectorioClientes, canActivate: [adminGuard] },
  { path: 'admin/logistica', component: MapaDespacho, canActivate: [adminGuard] },
  { path: 'rastreo', component: RastreoPedido, canActivate: [clienteGuard] },

  // Funciones avanzadas del panel (conectadas a las rutas probadas de Flask)
  {
    path: 'admin',
    component: MarcoAdmin,
    canActivate: [adminGuard],
    children: [
      { path: 'indicadores', loadComponent: () => import('./panel/paginas/admin/panel/panel').then(m => m.Panel) },
      { path: 'reportes', loadComponent: () => import('./panel/paginas/admin/reportes/reportes').then(m => m.Reportes) },
      { path: 'pedidos', loadComponent: () => import('./panel/paginas/admin/pedidos/pedidos-admin').then(m => m.PedidosAdmin) },
      { path: 'rutas', loadComponent: () => import('./panel/paginas/admin/rutas/rutas').then(m => m.Rutas) },
      { path: 'repartidores', loadComponent: () => import('./panel/paginas/admin/repartidores/repartidores').then(m => m.Repartidores) },
      { path: 'produccion', loadComponent: () => import('./panel/paginas/admin/inventario/inventario').then(m => m.Inventario) },
      { path: 'crm/:id', loadComponent: () => import('./panel/paginas/admin/cliente-ficha/cliente-ficha').then(m => m.ClienteFicha) }
    ]
  },

  { path: '**', redirectTo: '' }
];