# Workflow

## Responsabilidad

```txt
Definir el flujo operacional completo de una OT.
No describe implementación técnica.
No reemplaza current-state.md.
```

## Actores

```txt
Técnico
Admin
Secretaria
```

## Flujo operacional

```txt
1. El técnico toma la fotografía del informe.

2. El sistema procesa la imagen y calcula el semáforo.

3. Si el semáforo es ROJO, el técnico debe volver a tomar la fotografía.

4. Si el flujo continúa, la OT queda disponible para el Admin.

5. El Admin asigna la OT a una secretaria.

6. Cada secretaria ve únicamente su propia cola de trabajo.

7. La secretaria compara el informe original contra el documento generado.

8. La secretaria corrige lo que esté malo.

9. La secretaria aprueba la OT.

10. Desde la aprobación siempre sale un documento final al flujo operativo.
```

## Ubicación de la OT

```txt
Cada OT debe tener un estado actual y un dueño actual.

current_state indica dónde está la OT.

current_owner_type indica qué tipo de actor la tiene.

current_owner_id identifica al actor específico.
```

## Modelo mínimo

```txt
reports.current_state
reports.current_owner_type
reports.current_owner_id
```

Ejemplo:

```txt
current_state = assigned_to_secretary
current_owner_type = secretary
current_owner_id = secretaria_1
```

## Eventos de trazabilidad

```txt
report_events registra cada movimiento relevante.

Ejemplos:

assigned_to_secretary
secretary_fix_saved
secretary_approved
final_document_generated
```

## Invariantes

```txt
Siempre debe poder saberse dónde está la OT.

Siempre debe poder saberse quién tiene la OT.

El técnico no corrige información.

La secretaria hace los fixes.

La secretaria siempre produce una versión final aprobada.

Siempre existe un documento final antes de continuar el flujo.

El documento final es el único que sale al proceso operativo.
```

## Qué no hacer

```txt
No documentar este flujo como implementado completo.
No duplicar este flujo en otros documentos.
No crear un workflow engine genérico todavía.
No mover corrección de datos al técnico.
No saltarse la revisión/fix de secretaria.
```