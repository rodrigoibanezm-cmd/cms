# Principios

## Regla principal

```txt
La mejor solución es la más simple que deje trazabilidad.
```

## Reglas de implementación

```txt
No inventar.
No suponer.
Si falta información relevante, preguntar.
No cambiar comportamiento funcional sin autorización.
Preferir solución simple, modular y explícita.
No agregar dependencias si el problema se resuelve con las actuales.
Centralizar reglas de negocio; no duplicarlas.
Una fuente de verdad por dato.
Mantener trazabilidad de estados y eventos.
```

## Tamaño y estructura

```txt
Ningún archivo debe superar 120 líneas.
Si un archivo crece, se refactoriza antes de seguir agregando lógica.
1 archivo = 1 responsabilidad principal.
1 función = 1 intención clara.
```

## IA

```txt
La IA extrae.
La IA audita.
La IA puede releer campos acotados.
La IA no genera Excel.
La IA no decide cierre administrativo.
```

## Backend

```txt
El backend valida.
El backend calcula confianza.
El backend genera XLS.
El backend guarda estado.
El backend decide forma del JSON.
```

## Front técnico

```txt
Debe mantenerse simple.
Debe aceptar informe y fotos.
No debe pedir correcciones complejas al técnico.
No debe exponer detalles internos del pipeline.
```

## Admin

```txt
El admin revisa evidencia.
El admin compara informe original contra XLS.
El admin debe cerrar aprobación/rechazo cuando exista el flujo.
```

## Datos

```txt
Neon es fuente de verdad.
Drive es repositorio de archivos.
XLS es entregable.
JSON extraído debe quedar auditable.
```

## Excel

```txt
Plantilla oficial manda el formato.
Código determinístico llena el XLS.
Mapas hardcodeados son excepción.
La regla general es búsqueda dinámica por etiquetas.
```

## Documentación

```txt
1 doc = 1 responsabilidad.
Máximo 120 líneas.
No documentar planes como estado real.
Actualizar docs al cerrar una tarea.
Antes de implementar, leer solo los docs indicados para esa tarea.
```