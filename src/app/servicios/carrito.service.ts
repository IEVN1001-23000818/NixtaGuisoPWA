import { Injectable, signal, computed, effect, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ProductoCatalogo } from './catalogo.service';

export interface ItemCarrito {
  producto: ProductoCatalogo;
  cantidad: number;
  notaEspecial: string;
}

export interface DatosEntrega {
  calle: string;
  colonia: string;
  ciudad: string;
  referencias: string;
}

const CLAVE_CARRITO = 'nixtaguiso_carrito';

interface CalculoServidor {
  exito: boolean;
  mensaje?: string;
  subtotal: number;
  descuento: number;
  motivo_descuento: string | null;
  costo_envio: number;
  total: number;
  cumple_minimo: boolean;
  mensaje_minimo: string | null;
  faltantes: { nombre: string }[];
  puede_confirmar: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class CarritoService {
  // Se guarda en el navegador para que no se pierda al recargar la página
  readonly items = signal<ItemCarrito[]>(this.leerCarritoGuardado());

  private readonly guardarCarrito = effect(() => {
    try {
      localStorage.setItem(CLAVE_CARRITO, JSON.stringify(this.items()));
    } catch {
      // Si el navegador no permite guardar, el carrito dura mientras la página esté abierta
    }
  });

  private leerCarritoGuardado(): ItemCarrito[] {
    try {
      const guardado = JSON.parse(localStorage.getItem(CLAVE_CARRITO) || '[]');
      return Array.isArray(guardado) ? guardado : [];
    } catch {
      return [];
    }
  }
  private readonly http = inject(HttpClient);

  /**
   * Cálculo oficial de Flask (/api/pedidos/calcular): precio según el tipo de cliente,
   * descuento de primer pedido, envío ($30, gratis desde $250) y pedido mínimo.
   * Es el mismo cálculo con el que se cobra el pedido.
   */
  readonly calculo = signal<CalculoServidor | null>(null);
  private esperaCalculo?: ReturnType<typeof setTimeout>;

  private readonly recalcular = effect(() => {
    const items = this.items();
    clearTimeout(this.esperaCalculo);
    if (items.length === 0) {
      this.calculo.set(null);
      return;
    }
    this.esperaCalculo = setTimeout(() => {
      this.http.post<CalculoServidor>('http://localhost:5000/api/pedidos/calcular', {
        productos: items.map((i) => ({ id_producto: i.producto.id, cantidad: i.cantidad })),
        modalidad: 'domicilio',
      }, { withCredentials: true }).subscribe({
        next: (r) => this.calculo.set(r),
        error: (e) => this.calculo.set({ exito: false, mensaje: e?.error?.mensaje } as CalculoServidor),
      });
    }, 300);
  });

  readonly envio = computed(() => this.calculo()?.costo_envio ?? 30);
  readonly descuento = computed(() => this.calculo()?.descuento ?? 0);
  readonly motivoDescuento = computed(() => this.calculo()?.motivo_descuento ?? null);
  readonly avisoServidor = computed(() => {
    const c = this.calculo();
    if (!c) return null;
    if (c.exito === false) return c.mensaje || 'No se pudo calcular el total';
    if (!c.cumple_minimo) return c.mensaje_minimo;
    if (c.faltantes?.length) return `Sin existencia suficiente de: ${c.faltantes.map((f) => f.nombre).join(', ')}`;
    return null;
  });
  readonly puedeConfirmar = computed(() => !!this.calculo()?.puede_confirmar);
  readonly direccionEntrega = signal<DatosEntrega>(this.cargarDireccionInicial());

  readonly totalArticulos = computed(() =>
    this.items().reduce((acc, item) => acc + item.cantidad, 0)
  );

  readonly subtotal = computed(() => {
    const c = this.calculo();
    if (c?.exito !== false && c?.subtotal !== undefined) return c.subtotal;
    return this.items().reduce((acc, item) => acc + item.producto.precio * item.cantidad, 0);
  });

  readonly total = computed(() => {
    if (this.items().length === 0) return 0;
    const c = this.calculo();
    return c?.exito !== false && c?.total !== undefined ? c.total : this.subtotal() + this.envio();
  });

  readonly direccionResumen = computed(() => {
    const d = this.direccionEntrega();
    return [d.calle, d.colonia, d.ciudad].map((v) => v?.trim()).filter(Boolean).join(', ');
  });

  agregarProducto(producto: ProductoCatalogo, cantidad = 1, notaEspecial = ''): void {
    const notaLimpia = notaEspecial.trim();
    this.items.update((actual) => {
      const idx = actual.findIndex(
        (i) => i.producto.id === producto.id && i.notaEspecial === notaLimpia
      );
      if (idx >= 0) {
        const copia = [...actual];
        copia[idx] = {
          ...copia[idx],
          cantidad: copia[idx].cantidad + cantidad,
        };
        return copia;
      }
      return [...actual, { producto, cantidad, notaEspecial: notaLimpia }];
    });
  }

  actualizarCantidad(indice: number, nuevaCantidad: number): void {
    if (nuevaCantidad <= 0) {
      this.eliminarItem(indice);
      return;
    }
    this.items.update((actual) => {
      const copia = [...actual];
      if (copia[indice]) {
        copia[indice] = { ...copia[indice], cantidad: nuevaCantidad };
      }
      return copia;
    });
  }

  eliminarItem(indice: number): void {
    this.items.update((actual) => actual.filter((_, i) => i !== indice));
  }

  establecerDireccion(datos: DatosEntrega, idUsuario?: number | null): void {
    const limpia: DatosEntrega = {
      calle: (datos.calle || '').trim(),
      colonia: (datos.colonia || '').trim(),
      ciudad: (datos.ciudad || 'León, Guanajuato').trim(),
      referencias: (datos.referencias || '').trim(),
    };
    this.direccionEntrega.set(limpia);
    try {
      localStorage.setItem(this.claveDireccion(idUsuario), JSON.stringify(limpia));
    } catch {}
  }

  cargarDireccionUsuario(idUsuario?: number | null): DatosEntrega {
    try {
      const raw = localStorage.getItem(this.claveDireccion(idUsuario));
      if (raw) {
        const parsed = JSON.parse(raw) as Partial<DatosEntrega>;
        const cargada: DatosEntrega = {
          calle: (parsed.calle || '').trim(),
          colonia: (parsed.colonia || '').trim(),
          ciudad: (parsed.ciudad || 'León, Guanajuato').trim(),
          referencias: (parsed.referencias || '').trim(),
        };
        if (cargada.calle || cargada.colonia) {
          this.direccionEntrega.set(cargada);
          return cargada;
        }
      }
    } catch {}
    return this.direccionEntrega();
  }

  vaciar(): void {
    this.items.set([]);
  }

  private cargarDireccionInicial(): DatosEntrega {
    try {
      const keys = Object.keys(localStorage).filter((k) => k.startsWith('nixtaguiso_dir_'));
      for (const k of keys) {
        const raw = localStorage.getItem(k);
        if (raw) {
          const parsed = JSON.parse(raw) as Partial<DatosEntrega>;
          if (parsed.calle || parsed.colonia) {
            return {
              calle: (parsed.calle || '').trim(),
              colonia: (parsed.colonia || '').trim(),
              ciudad: (parsed.ciudad || 'León, Guanajuato').trim(),
              referencias: (parsed.referencias || '').trim(),
            };
          }
        }
      }
    } catch {}
    return {
      calle: '',
      colonia: '',
      ciudad: 'León, Guanajuato',
      referencias: '',
    };
  }

  private claveDireccion(idUsuario?: number | null): string {
    return `nixtaguiso_dir_${idUsuario ?? 'general'}`;
  }
}