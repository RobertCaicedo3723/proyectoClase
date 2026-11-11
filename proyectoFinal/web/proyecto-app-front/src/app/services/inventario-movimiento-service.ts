import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

// Estos nombres deben coincidir con el JSON que entrega Spring Boot.
export type TipoMovimiento = 'ENTRADA' | 'SALIDA';

export interface Movimiento {
  id: number;
  productoCodigo: string;
  tipo: TipoMovimiento;
  cantidad: number;
  fecha: string;
}

// H2 genera el identificador. El formulario envía únicamente los otros campos.
export type DatosMovimiento = Omit<Movimiento, 'id'>;

@Injectable({ providedIn: 'root' })
export class InventarioMovimientoService {
  private readonly baseUrl = 'http://localhost:8080/api/inventario-movimientos';

  constructor(private readonly http: HttpClient) {}

  listar(): Observable<Movimiento[]> {
    return this.http.get<Movimiento[]>(this.baseUrl);
  }

  crear(datos: DatosMovimiento): Observable<Movimiento> {
    return this.http.post<Movimiento>(this.baseUrl, datos);
  }

  actualizar(id: number, datos: DatosMovimiento): Observable<Movimiento> {
    return this.http.put<Movimiento>(`${this.baseUrl}/${id}`, datos);
  }

  eliminar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
