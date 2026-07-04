# Destination

## Responsabilidad

```txt
Describir hacia dónde va el producto.
No describe estado actual.
No define implementación técnica cerrada.
No reemplaza current-state.md.
```

## Regla principal

```txt
Destino describe comportamiento esperado de negocio.
La forma técnica se decide en el camino.
No se sobredefine antes de implementar.
```

## Lectura correcta

```txt
Primero leer docs/current-state.md para saber qué existe.
Luego leer esta carpeta para entender hacia dónde se quiere llegar.
```

## Producto destino

```txt
El técnico captura evidencia.
El sistema procesa y semaforiza.
El admin distribuye trabajo.
La secretaria corrige y aprueba.
El sistema genera documento final.
El admin controla operación y eficiencia.
```

## Flujo objetivo

```txt
1. Técnico toma foto del informe.

2. Sistema procesa imagen y calcula semáforo.

3. Si semáforo es ROJO, técnico repite foto.

4. Si el flujo continúa, la OT entra a cola admin.

5. Admin asigna OT a secretaria.

6. Secretaria ve solo su cola.

7. Secretaria abre OT asignada.

8. Secretaria corrige lo que esté malo.

9. Secretaria aprueba la OT.

10. Se genera documento final.

11. Documento final continúa al flujo operativo.
```

## Ubicación de OT

```txt
Toda OT activa debe saber dónde vive.
Toda OT activa debe tener estado actual.
Toda OT activa debe tener dueño actual.
```

## Métricas destino

```txt
vida activa de una OT
tiempo desde asignación hasta apertura
tiempo desde apertura hasta aprobación
tiempo total desde asignación hasta aprobación
OTs activas por secretaria
OTs fuera de SLA
backlog por secretaria
ranking operativo por secretaria
```

## Dashboard destino

```txt
cola total
OT por estado
OT por secretaria
OT aprobadas
OT pendientes
OT atrasadas
PDF/documentos finales disponibles
eficiencia por secretaria
```

## Invariantes

```txt
El técnico no corrige datos.

La secretaria hace los fixes.

La secretaria siempre produce una versión final aprobada.

El documento final es el único que sale al flujo operativo.

El admin debe saber dónde está cada OT.

Las métricas deben salir de estados, timestamps y eventos reales.
```

## Qué no hacer

```txt
No documentar destino como si estuviera implementado.
No convertir destino en backlog técnico.
No crear motor genérico antes de necesitarlo.
No diseñar UI final completa en este documento.
No duplicar este flujo fuera de destination o workflow.md.
```