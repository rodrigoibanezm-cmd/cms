# CMS

## Objetivo
Digitalizar automáticamente informes técnicos manuscritos y generar el mismo Excel utilizado por el cliente, incorporando el registro fotográfico.

## Flujo
1. Técnico fotografía el formulario y el equipo.
2. Envía desde la app móvil.
3. Pipeline IA extrae y valida la información.
4. Código genera el Excel desde una plantilla.
5. Una IA audita el resultado.
6. El Excel se guarda automáticamente en Google Drive.

## Principios
- El técnico no vuelve a escribir información.
- La IA extrae datos; no genera el Excel.
- El Excel se construye mediante código determinístico.
- Todo el procesamiento queda registrado en Neon.

## Arquitectura
- Frontend: Web móvil.
- Backend: API.
- Base de datos: Neon (fuente de verdad).
- Almacenamiento: Google Drive.

## Pipeline
- IA1 e IA2 ejecutan extracción en paralelo.
- Si existe discrepancia relevante, se utiliza un modelo de mayor capacidad para resolverla.
- Se genera un JSON estructurado.
- El JSON alimenta la plantilla Excel.
- Auditoría IA verifica imagen original vs Excel final antes de entregar.

## Datos
Se almacenan órdenes de trabajo, imágenes, resultados de cada pasada IA, auditorías, costos, versiones del pipeline y artefactos generados.

## Objetivo de calidad
Lograr al menos un 90% de informes procesados sin intervención humana, utilizando un banco de aproximadamente 100 informes reales para calibración y pruebas.
