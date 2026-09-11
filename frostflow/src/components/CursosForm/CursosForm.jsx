import { useEffect, useState } from "react";
import "./CursosForm.css";

const cursoInicial = {
  nombre: "",
  codigo: "",
  profesor: "",
  creditos: 4,
  semestre: "III 2026",
  color: "blue",
  estado: "activo",
};

function CursosForm({
  cursoEditar,
  onGuardar,
  onCancelar,
}) {
  const [formulario, setFormulario] = useState(cursoInicial);

  useEffect(() => {
    if (cursoEditar) {
      setFormulario({
        nombre: cursoEditar.nombre || "",
        codigo: cursoEditar.codigo || "",
        profesor: cursoEditar.profesor || "",
        creditos: cursoEditar.creditos ?? 4,
        semestre: cursoEditar.semestre || "III 2026",
        color: cursoEditar.color || "blue",
        estado: cursoEditar.estado || "activo",
      });
    } else {
      setFormulario(cursoInicial);
    }
  }, [cursoEditar]);

  const manejarCambio = (e) => {
    const { name, value } = e.target;

    setFormulario((actual) => ({
      ...actual,
      [name]:
        name === "creditos"
          ? Number(value)
          : value,
    }));
  };

  const manejarSubmit = (e) => {
    e.preventDefault();

    if (
      !formulario.nombre.trim() ||
      !formulario.codigo.trim()
    ) {
      return;
    }

    onGuardar({
      ...formulario,
      creditos: Number(formulario.creditos),
    });
  };

  return (
    <form className="curso-form" onSubmit={manejarSubmit}>
      <div className="form-header">
        <div>
          <span className="form-eyebrow">
            {cursoEditar
              ? "Editar curso"
              : "Nuevo curso"}
          </span>

          <h2>
            {cursoEditar
              ? "Actualizar información"
              : "Agregar curso"}
          </h2>

          <p>
            {cursoEditar
              ? "Modifica los datos de esta materia."
              : "Registra una nueva materia para organizar tus entregas."}
          </p>
        </div>

        <div className="form-icon">
          {cursoEditar ? "✎" : "+"}
        </div>
      </div>

      <div className="form-grid">
        <div className="campo">
          <label htmlFor="nombre">
            Nombre del curso
          </label>

          <input
            id="nombre"
            name="nombre"
            type="text"
            value={formulario.nombre}
            onChange={manejarCambio}
            placeholder="Ej. Desarrollo Web"
            required
          />
        </div>

        <div className="campo">
          <label htmlFor="codigo">
            Código
          </label>

          <input
            id="codigo"
            name="codigo"
            type="text"
            value={formulario.codigo}
            onChange={manejarCambio}
            placeholder="Ej. INF-302"
            required
          />
        </div>

        <div className="campo">
          <label htmlFor="profesor">
            Profesor
          </label>

          <input
            id="profesor"
            name="profesor"
            type="text"
            value={formulario.profesor}
            onChange={manejarCambio}
            placeholder="Nombre del profesor"
          />
        </div>

        <div className="campo">
          <label htmlFor="creditos">
            Créditos
          </label>

          <select
            id="creditos"
            name="creditos"
            value={formulario.creditos}
            onChange={manejarCambio}
          >
            <option value={1}>1 crédito</option>
            <option value={2}>2 créditos</option>
            <option value={3}>3 créditos</option>
            <option value={4}>4 créditos</option>
            <option value={5}>5 créditos</option>
            <option value={6}>6 créditos</option>
          </select>
        </div>

        <div className="campo">
          <label htmlFor="semestre">
            Periodo académico
          </label>

          <select
            id="semestre"
            name="semestre"
            value={formulario.semestre}
            onChange={manejarCambio}
          >
            <option value="I 2026">
              I 2026
            </option>
            <option value="II 2026">
              II 2026
            </option>
            <option value="III 2026">
              III 2026
            </option>
            <option value="I 2027">
              I 2027
            </option>
          </select>
        </div>

        <div className="campo">
          <label htmlFor="estado">
            Estado
          </label>

          <select
            id="estado"
            name="estado"
            value={formulario.estado}
            onChange={manejarCambio}
          >
            <option value="activo">
              Activo
            </option>
            <option value="inactivo">
              Inactivo
            </option>
          </select>
        </div>

        <div className="campo">
          <label>
            Color del curso
          </label>

          <div className="colores-cursos">
            {[
              ["blue", "Azul"],
              ["lavender", "Lavanda"],
              ["ice", "Hielo"],
              ["steel", "Acero"],
              ["slate", "Pizarra"],
            ].map(([valor, nombreColor]) => (
              <button
                key={valor}
                type="button"
                title={nombreColor}
                aria-label={`Seleccionar color ${nombreColor}`}
                className={`color-option color-${valor} ${
                  formulario.color === valor
                    ? "seleccionado"
                    : ""
                }`}
                onClick={() =>
                  setFormulario((actual) => ({
                    ...actual,
                    color: valor,
                  }))
                }
              >
                {formulario.color === valor && "✓"}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="form-actions">
        <button
          type="button"
          className="btn-secundario"
          onClick={onCancelar}
        >
          Cancelar
        </button>

        <button
          type="submit"
          className="btn-guardar"
        >
          {cursoEditar
            ? "Guardar cambios"
            : "Guardar curso"}
        </button>
      </div>
    </form>
  );
}

export default CursosForm;