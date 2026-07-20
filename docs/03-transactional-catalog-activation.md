# Activación transaccional del catálogo

## Objetivo

Definir el contrato de consistencia para registrar y activar versiones sin mezclar compilación, activación ni reprocesamiento.

## Ciclo de vida

La compilación produce artefactos inmutables fuera de la base de datos.

```text
compiled artifact
      ↓
registered
      ↓
active
      ↓
superseded
```

`compiled` no es un estado persistido. Describe un artefacto válido producido por el compilador y acompañado por su manifest.

`registered`, `active` y `superseded` sí son estados persistidos.

## Invariantes

```text
Existe exactamente una versión activa.
Solo puede existir una activación en curso.
Una compilación nunca modifica el estado activo.
Activar una versión es atómico.
Una falla no deja versiones parcialmente activadas.
Una falla no deja solicitudes de reproceso visibles.
Toda solicitud de reproceso referencia una versión ya activada.
```

## Precondiciones

La activación recibe explícitamente:

```text
compiled_catalog
manifest
version
parent_version
catalog_hash
decisions_hash
compiler_version
reports_to_reprocess
```

Antes de abrir la transacción se valida:

- consistencia entre manifest y artefacto compilado;
- identidad de versión y versión padre;
- hashes válidos;
- conjunto cerrado de reportes a reprocesar;
- ausencia de efectos secundarios pendientes.

## Exclusión concurrente

El contrato garantiza:

```text
Solo puede existir una activación en curso.
```

La implementación puede usar advisory lock, fila singleton o bloqueo equivalente. El mecanismo no cambia la garantía.

## Secuencia transaccional

```text
BEGIN

adquirir exclusión de activación
validar precondiciones persistentes
registrar nueva versión como registered
marcar versión activa anterior como superseded
marcar nueva versión como active
crear solicitudes de reproceso pending

COMMIT
```

El reprocesamiento no se ejecuta dentro de esta transacción.

## Idempotencia

Activar una versión que ya es la activa retorna éxito, no modifica estado y no crea nuevas solicitudes de reproceso.

Reintentar una activación fallida debe producir el mismo resultado que ejecutarla una sola vez.

## Rollback

Si no existe `COMMIT`:

```text
la versión activa permanece idéntica
no existe una versión parcialmente activada
no existen solicitudes de reproceso visibles
```

## Cola de reproceso

Cada solicitud registra como mínimo:

```text
report_id
catalog_version_id
status = pending
```

La cola se crea dentro de la misma transacción que activa la versión. El worker opera después del commit y puede reanudarse sin alterar el estado activo.

## Fuera de alcance

- SQL concreto;
- implementación del lock;
- worker y sus reintentos;
- API;
- UI;
- rollback operativo hacia una versión anterior.
