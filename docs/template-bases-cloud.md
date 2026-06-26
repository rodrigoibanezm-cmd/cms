# Bases tecnicas en la nube

Fuente de verdad:

- `candidatos_plantillas`: contiene OT reales agrupadas por familia.
- `Bases`: contiene los XLS limpios que se usan como plantilla.

El workflow `Build template bases` toma una familia, descarga un candidato, limpia datos escritos y sube el XLS base a Drive.

## Uso

GitHub Actions -> `Build template bases` -> `Run workflow`.

Inputs:

- `families`: familias separadas por coma. Ejemplo: `GIRAMOTOR,MESA_LEVANTE`.
- `candidates_folder`: ID o URL de la carpeta `candidatos_plantillas`.
- `bases_folder`: ID o URL de la carpeta `Bases`.

## Secretos soportados

Opcion 1:

- `GOOGLE_SERVICE_ACCOUNT_JSON`

Opcion 2:

- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `GOOGLE_REFRESH_TOKEN`

La cuenta usada debe tener acceso de escritura a la carpeta `Bases` y lectura a `candidatos_plantillas`.

## Que limpia

- deja solo la hoja tecnica;
- elimina hojas fotograficas;
- limpia OT, cliente, rotulo, tecnico, fecha y datos variables;
- borra marcas `X`;
- borra textos tipeados de observaciones, prueba, desarme y procedimiento;
- conserva formato, bordes, merges, anchos y alturas.
