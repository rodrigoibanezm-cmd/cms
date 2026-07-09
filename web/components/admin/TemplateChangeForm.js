import styles from '../../app/admin/report/review.module.css';

function withToken(path, token) {
  return token ? `${path}${path.includes('?') ? '&' : '?'}token=${encodeURIComponent(token)}` : path;
}

export default function TemplateChangeForm({ report, token, templates = [] }) {
  const returnTo = withToken(`/admin/report?id=${report.id}`, token);
  const action = withToken(`/api/admin/reports/${report.id}/template`, token);

  return (
    <form className={styles.templateForm} action={action} method="post" encType="multipart/form-data">
      <input type="hidden" name="return_to" value={returnTo} />
      <label>
        Cambiar plantilla
        <select name="template_filename" defaultValue="">
          <option value="">Elegir base existente</option>
          {templates.map((template) => (
            <option key={template.id || template.name} value={template.name}>{template.name}</option>
          ))}
        </select>
      </label>
      <label>
        Agregar nueva base
        <input type="file" name="template_file" accept=".xlsx" />
      </label>
      <button type="submit">Regenerar XLS</button>
    </form>
  );
}