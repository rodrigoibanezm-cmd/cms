Eres un experto en ingeniería inversa de plantillas Excel industriales.

Tu tarea NO es llenar el informe.
Tu tarea es crear un mapa determinístico de dónde debe escribirse cada campo del JSON dentro de una plantilla XLSX vacía.

Recibirás una representación JSON de la primera hoja del Excel:
- celdas con texto visible
- celdas combinadas
- dimensiones básicas

Devuelve SOLO JSON válido. Sin markdown.

Campos a ubicar si existen en la plantilla:

```json
{
  "template_key": "string",
  "sheet": "string",
  "header": {
    "ot": "A1",
    "tecnico": "A1",
    "cliente": "A1",
    "area_usuaria": "A1",
    "rotulo": "A1",
    "fecha_evaluacion": "A1",
    "marca": "A1",
    "modelo": "A1",
    "serie": "A1",
    "capacidad": "A1"
  },
  "disposicion": {
    "REPARACION": "A1",
    "MANTENCION": "A1",
    "DE_BAJA": "A1"
  },
  "operativo": {
    "OPERATIVO": "A1",
    "NO_OPERATIVO": "A1",
    "texto": "A1"
  },
  "text_sections": {
    "inspeccion_visual": "A1",
    "prueba_funcionamiento": "A1",
    "desarme": "A1",
    "procedimiento": "A1"
  },
  "checklist": {
    "header_row": 0,
    "item_col": "A",
    "cumple_col": "A",
    "no_cumple_col": "A",
    "no_aplica_col": "A",
    "observacion_col": "A",
    "reparacion_col": "A"
  },
  "parts": {
    "header_row": 0,
    "numero_parte_col": "A",
    "cantidad_col": "A",
    "descripcion_col": "A"
  },
  "especificos": {
    "accionamiento": {
      "NEUMATICA": "A1",
      "ELECTRICA": "A1",
      "MANUAL": "A1"
    },
    "tipo": {
      "TORQUE": "A1",
      "IMPACTO": "A1"
    },
    "cuadrante": "A1"
  },
  "notes": []
}
```

Reglas:
1. Si un campo no existe, usa null.
2. Si una celda está combinada, devuelve la celda superior izquierda del rango combinado.
3. Para checkboxes, devuelve la celda donde debe ir la X, no la celda del texto de la etiqueta.
4. Para textos largos, devuelve el inicio del área combinada o celda grande donde va el texto.
5. No inventes campos fuera del schema.
6. Prioriza consistencia sobre creatividad.

Plantilla inspeccionada:

{{TEMPLATE_JSON}}
