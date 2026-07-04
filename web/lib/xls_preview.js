// LEGACY
//
// Este módulo queda fuera del flujo runtime.
// El preview SVG del XLS no se produce porque no sirve para revisión fina.
//
// Regla vigente:
// - process-report publica solo generated_xls.
// - admin revisa el XLS real desde excel_url.
// - no registrar generated_xls_preview para nuevas OTs.

export function xlsPreviewDisabled() {
  return true;
}
