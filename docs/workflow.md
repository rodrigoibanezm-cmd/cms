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
2. El sistema procesa la imagen.
3. Si la imagen no es legible, el técnico debe repetirla.
4. Si el flujo continúa, la OT queda en cola admin sin tenant.
5. El Admin asigna la OT a una secretaria.
6. La asignación fija tenant y dueño actual.
7. Cada secretaria ve su propia cola.
8. La cola incluye pendientes y aprobadas.
9. La secretaria compara informe original contra XLS.
10. La secretaria aprueba la OT desde el detalle.
11. Desde la aprobación se habilita el documento final.
```

## Ubicación de la OT

```txt
Cada OT debe tener un estado actual y un dueño actual.
current_state indica dónde está la OT.
current_owner_type indica qué tipo de actor la tiene.
current_owner_id identifica al actor específico.
tenant_id permite separar operación y filtrar cola.
```

## Estados actuales

```txt
processing
admin_queue
assigned_to_secretary
secretary_approved
error
```

## Ejemplos

Sin asignar:

```txt
current_state = admin_queue
current_owner_type = admin
current_owner_id = null
tenant_id = null
```

Asignada:

```txt
current_state = assigned_to_secretary
current_owner_type = secretary
current_owner_id = secretaria_1
tenant_id = tenant_operativo
```

Aprobada:

```txt
current_state = secretary_approved
secretary_approved_at = now()
approved_at = now()
```

## Eventos de trazabilidad

```txt
report_events registra cada movimiento relevante.

Ejemplos:
workflow_admin_queue
assigned_to_secretary
approved
final_document_generated
```

## Invariantes

```txt
Siempre debe poder saberse dónde está la OT.
Siempre debe poder saberse quién tiene la OT.
El técnico no corrige información.
La secretaria hace los fixes cuando exista edición.
La aprobación no borra la secretaria asignada.
Siempre existe un documento final antes de continuar el flujo.
```

## Qué no hacer

```txt
No documentar este flujo como implementado completo.
No duplicar este flujo en otros documentos.
No crear un workflow engine genérico todavía.
No mover corrección de datos al técnico.
No saltarse la revisión/fix de secretaria.
```