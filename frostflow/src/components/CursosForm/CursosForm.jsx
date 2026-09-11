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

function CursosForm({ cursoEditar, onGuardar, onCancelar }) {
  const [formulario, setFormulario] = useState(cursoInicial);

  useEffect(() => {
    if (cursoEditar) {
      setFormulario({
        nombre: cursoEditar.nombre || "",
        codigo: cursoEditar.codigo || "",
        profesor: cursoEditar.profesor || "",
        creditos: cursoEditar.creditos || 4,
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
      [name]: name === "creditos" ? Number(value) : value,
    }));
  };

  const manejarSubmit = (e) => {
    e.preventDefault();

    if (!formulario.nombre.trim() || !formulario.codigo.trim()) {
      return;
    }

    onGuardar(formulario);

    if (!cursoEditar) {
      setFormulario(cursoInicial);
    }
  };

  return (
    <form className="curso-form" onSubmit={manejarSubmit}>
      <div className="form-header">
        <div>
          <span className="form-eyebrow">
            {cursoEditar ? "Editar curso" : "Nuevo registro"}
          </span>

          <h2>
            {cursoEditar ? "Actualizar curso" : "Agregar curso"}
          </h2>

          <p>
            Registra la información académica para organizar tus entregas.
          </p>
        </div>

        <div className="form-icon">
          {cursoEditar ? "✎" : "+"}
        </div>
      </div>

      <div className="form-grid">
        <div className="campo campo-grande">
          <label htmlFor="nombre">Nombre del curso</label>

          <input
            id="nombre"
            name="nombre"
            type="text"
            value={formulario.nombre}
            onChange={manejarCambio}
            placeholder="Ej. Programación Web"
            required
          />
        </div>

        <div className="campo">
          <label htmlFor="codigo">Código</label>

          <input
            id="codigo"
            name="codigo"
            type="text"
            value={formulario.codigo}
            onChange={manejarCambio}
            placeholder="Ej. PW-301"
            required
          />
        </div>

        <div className="campo campo-grande">
          <label htmlFor="profesor">Profesor</label>

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
          <label htmlFor="creditos">Créditos</label>

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
          <label htmlFor="semestre">Semestre</label>

          <input
            id="semestre"
            name="semestre"
            type="text"
            value={formulario.semestre}
            onChange={manejarCambio}
            placeholder="Ej. III 2026"
          />
        </div>

        <div className="campo">
          <label htmlFor="estado">Estado</label>

          <select
            id="estado"
            name="estado"
            value={formulario.estado}
            onChange={manejarCambio}
          >
            <option value="activo">Activo</option>
            <option value="finalizado">Finalizado</option>
            <option value="inactivo">Inactivo</option>
          </select>
        </div>

        <div className="campo campo-grande">
          <label>Identidad visual</label>

          <div className="colores-cursos">
            {["blue", "lavender", "ice", "steel", "slate"].map((color) => (
              <button
                key={color}
                type="button"
                className={`color-option color-${color} ${
                  formulario.color === color ? "seleccionado" : ""
                }`}
                onClick={() =>
                  setFormulario((actual) => ({
                    ...actual,
                    color,
                  }))
                }
                aria-label={`Seleccionar color ${color}`}
              >
                {formulario.color === color && "✓"}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="form-actions">
        {cursoEditar && (
          <button
            type="button"
            className="btn-secundario"
            onClick={onCancelar}
          >
            Cancelar
          </button>
        )}

        <button type="submit" className="btn-guardar">
          {cursoEditar ? "Guardar cambios" : "Agregar curso"}
        </button>
      </div>
    </form>
  );
}

export default CursosForm;