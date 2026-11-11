import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import {
  Component,
  DestroyRef,
  ElementRef,
  OnInit,
  ViewChild,
  computed,
  inject,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  AbstractControl,
  FormBuilder,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { finalize } from 'rxjs';
import {
  DatosMovimiento,
  InventarioMovimientoService,
  Movimiento,
  TipoMovimiento,
} from '../../services/inventario-movimiento-service';

// Se usa la fecha local para que el valor inicial respete el día de Colombia.
function hoy(): string {
  const fecha = new Date();
  const local = new Date(fecha.getTime() - fecha.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 10);
}

// Además del formato, comprueba que el día exista en el calendario.
function validarFecha(control: AbstractControl): ValidationErrors | null {
  const valor = String(control.value ?? '');
  if (!valor) return null;
  const fecha = new Date(`${valor}T12:00:00Z`);
  return /^\d{4}-\d{2}-\d{2}$/.test(valor) &&
    !Number.isNaN(fecha.getTime()) &&
    fecha.toISOString().slice(0, 10) === valor
    ? null
    : { fechaInvalida: true };
}

@Component({
  selector: 'app-inventario-movimiento-component',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './inventario-movimiento-component.html',
  styleUrl: './inventario-movimiento-component.css',
})
export class InventarioMovimientoComponent implements OnInit {
  private readonly servicio = inject(InventarioMovimientoService);
  private readonly fb = inject(FormBuilder);
  private readonly destroyRef = inject(DestroyRef);

  @ViewChild('editor') private editor!: ElementRef<HTMLDialogElement>;
  @ViewChild('confirmacion') private confirmacion!: ElementRef<HTMLDialogElement>;

  // Los signals son el estado que Angular mantiene sincronizado con la vista.
  readonly movimientos = signal<Movimiento[]>([]);
  readonly cargando = signal(true);
  readonly guardando = signal(false);
  readonly eliminando = signal(false);
  readonly error = signal('');
  readonly errorFormulario = signal('');
  readonly errorEliminacion = signal('');
  readonly mensaje = signal('');
  readonly editandoId = signal<number | null>(null);
  readonly seleccionado = signal<Movimiento | null>(null);
  readonly ultimaCarga = signal<Date | null>(null);
  readonly busqueda = signal('');
  readonly filtroTipo = signal<'TODOS' | TipoMovimiento>('TODOS');
  readonly desde = signal('');
  readonly hasta = signal('');
  readonly pagina = signal(1);
  readonly porPagina = 6;

  readonly formulario = this.fb.nonNullable.group({
    productoCodigo: [
      '',
      [
        Validators.required,
        Validators.maxLength(40),
        Validators.pattern(/^[A-Za-z0-9][A-Za-z0-9_-]*$/),
      ],
    ],
    tipo: this.fb.nonNullable.control<TipoMovimiento>('ENTRADA', [
      Validators.required,
      Validators.pattern(/^(ENTRADA|SALIDA)$/),
    ]),
    cantidad: [
      1,
      [
        Validators.required,
        Validators.min(1),
        Validators.max(2147483647),
        Validators.pattern(/^[1-9]\d*$/),
      ],
    ],
    fecha: [hoy(), [Validators.required, validarFecha]],
  });

  // El resumen siempre usa la lista completa, aunque se apliquen filtros.
  readonly entradas = computed(() =>
    this.movimientos()
      .filter((m) => m.tipo === 'ENTRADA')
      .reduce((total, m) => total + m.cantidad, 0),
  );
  readonly salidas = computed(() =>
    this.movimientos()
      .filter((m) => m.tipo === 'SALIDA')
      .reduce((total, m) => total + m.cantidad, 0),
  );
  readonly balance = computed(() => this.entradas() - this.salidas());
  readonly rangoInvalido = computed(() =>
    Boolean(this.desde() && this.hasta() && this.desde() > this.hasta()),
  );
  readonly hayFiltros = computed(() =>
    Boolean(this.busqueda() || this.filtroTipo() !== 'TODOS' || this.desde() || this.hasta()),
  );
  readonly filtrados = computed(() => {
    if (this.rangoInvalido()) return [];
    const texto = this.busqueda().trim().toUpperCase();
    return this.movimientos()
      .filter(
        (m) =>
          m.productoCodigo.toUpperCase().includes(texto) &&
          (this.filtroTipo() === 'TODOS' || m.tipo === this.filtroTipo()) &&
          (!this.desde() || m.fecha >= this.desde()) &&
          (!this.hasta() || m.fecha <= this.hasta()),
      )
      .sort((a, b) => b.fecha.localeCompare(a.fecha) || b.id - a.id);
  });
  readonly totalPaginas = computed(() =>
    Math.max(1, Math.ceil(this.filtrados().length / this.porPagina)),
  );
  readonly paginaActual = computed(() => Math.min(this.pagina(), this.totalPaginas()));
  readonly visibles = computed(() =>
    this.filtrados().slice(
      (this.paginaActual() - 1) * this.porPagina,
      this.paginaActual() * this.porPagina,
    ),
  );
  readonly primerRegistro = computed(() =>
    this.filtrados().length ? (this.paginaActual() - 1) * this.porPagina + 1 : 0,
  );
  readonly ultimoRegistro = computed(() =>
    Math.min(this.paginaActual() * this.porPagina, this.filtrados().length),
  );

  ngOnInit(): void {
    this.cargar();
  }

  cargar(): void {
    if (this.guardando() || this.eliminando()) return;
    this.cargando.set(true);
    this.error.set('');
    this.servicio
      .listar()
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.cargando.set(false)),
      )
      .subscribe({
        next: (lista) => {
          this.movimientos.set(lista);
          this.ultimaCarga.set(new Date());
        },
        error: (err: HttpErrorResponse) => this.error.set(this.describirError(err)),
      });
  }

  buscar(texto: string): void {
    this.busqueda.set(texto);
    this.pagina.set(1);
  }

  cambiarTipo(valor: string): void {
    if (valor === 'TODOS' || valor === 'ENTRADA' || valor === 'SALIDA') this.filtroTipo.set(valor);
    this.pagina.set(1);
  }

  cambiarFecha(campo: 'desde' | 'hasta', valor: string): void {
    (campo === 'desde' ? this.desde : this.hasta).set(valor);
    this.pagina.set(1);
  }

  limpiarFiltros(): void {
    this.busqueda.set('');
    this.filtroTipo.set('TODOS');
    this.desde.set('');
    this.hasta.set('');
    this.pagina.set(1);
  }

  nuevo(): void {
    this.editandoId.set(null);
    this.errorFormulario.set('');
    this.formulario.reset({ productoCodigo: '', tipo: 'ENTRADA', cantidad: 1, fecha: hoy() });
    this.editor.nativeElement.showModal();
  }

  editar(movimiento: Movimiento): void {
    this.editandoId.set(movimiento.id);
    this.errorFormulario.set('');
    this.formulario.reset({
      productoCodigo: movimiento.productoCodigo,
      tipo: movimiento.tipo,
      cantidad: movimiento.cantidad,
      fecha: movimiento.fecha,
    });
    this.editor.nativeElement.showModal();
  }

  cerrarEditor(): void {
    if (!this.guardando()) this.editor.nativeElement.close();
  }

  cancelarEditor(evento: Event): void {
    if (this.guardando()) evento.preventDefault();
  }

  invalido(campo: keyof DatosMovimiento): boolean {
    const control = this.formulario.controls[campo];
    return control.touched && control.invalid;
  }

  guardar(): void {
    if (this.guardando()) return;
    this.formulario.markAllAsTouched();
    if (this.formulario.invalid) {
      this.editor.nativeElement
        .querySelector<HTMLElement>('input.ng-invalid, select.ng-invalid')
        ?.focus();
      return;
    }
    const datos: DatosMovimiento = {
      ...this.formulario.getRawValue(),
      productoCodigo: this.formulario.controls.productoCodigo.value.toUpperCase(),
    };
    const id = this.editandoId();
    const peticion = id === null ? this.servicio.crear(datos) : this.servicio.actualizar(id, datos);
    this.guardando.set(true);
    this.errorFormulario.set('');
    this.mensaje.set('');
    peticion
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.guardando.set(false)),
      )
      .subscribe({
        next: (respuesta) => {
          // No se cambia la lista hasta recibir la confirmación real de la API.
          this.movimientos.update((lista) =>
            id === null ? [...lista, respuesta] : lista.map((m) => (m.id === id ? respuesta : m)),
          );
          this.ultimaCarga.set(new Date());
          this.limpiarFiltros();
          this.editor.nativeElement.close();
          this.mensaje.set(
            id === null
              ? 'Movimiento registrado correctamente.'
              : 'Movimiento actualizado correctamente.',
          );
        },
        error: (err: HttpErrorResponse) => this.errorFormulario.set(this.describirError(err)),
      });
  }

  pedirEliminar(movimiento: Movimiento): void {
    this.seleccionado.set(movimiento);
    this.errorEliminacion.set('');
    this.confirmacion.nativeElement.showModal();
  }

  cerrarConfirmacion(): void {
    if (!this.eliminando()) this.confirmacion.nativeElement.close();
  }

  cancelarConfirmacion(evento: Event): void {
    if (this.eliminando()) evento.preventDefault();
  }

  eliminar(): void {
    const movimiento = this.seleccionado();
    if (!movimiento || this.eliminando()) return;
    this.eliminando.set(true);
    this.errorEliminacion.set('');
    this.mensaje.set('');
    this.servicio
      .eliminar(movimiento.id)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.eliminando.set(false)),
      )
      .subscribe({
        next: () => {
          this.movimientos.update((lista) => lista.filter((m) => m.id !== movimiento.id));
          this.ultimaCarga.set(new Date());
          this.confirmacion.nativeElement.close();
          this.seleccionado.set(null);
          this.mensaje.set('Movimiento eliminado correctamente.');
        },
        error: (err: HttpErrorResponse) => this.errorEliminacion.set(this.describirError(err)),
      });
  }

  private describirError(error: HttpErrorResponse): string {
    if (error.status === 0)
      return 'No hay conexión con la API. Verifica que Spring Boot esté activo en localhost:8080 y vuelve a intentar.';
    if (error.status === 404)
      return 'El registro ya no existe. Cierra esta ventana y actualiza el historial.';
    return 'No se pudo completar la operación. Vuelve a intentar. Los datos del formulario se conservan.';
  }
}
