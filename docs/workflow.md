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

## Invariantes

```txt
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
No mover corrección de datos al técnico.
No saltarse la revisión/fix de secretaria.
```