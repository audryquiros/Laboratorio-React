import { useEffect, useState } from "react";

import "./CursosForm.css";

const cursoInicial = {
  nombre: "",
  codigo: "",
  profesor: "",
  creditos: 4,
  semestre: "",
  color: "blue",
  estado: "en_curso",
  calificacion: null,
};

function CursosForm({
  cursoEditar,
  onGuardar,
  onCancelar,
}) {
  const [formulario, setFormulario] =
    useState(cursoInicial);

  useEffect(() => {
    if (cursoEditar) {
      let estado =
        cursoEditar.estado ||
        "pendiente";

      /*
        Compatibilidad con los cursos
        que ya estaban guardados.
      */

      if (estado === "activo") {
        estado = "en_curso";
      }

      if (estado === "inactivo") {
        estado = "culminado";
      }

      setFormulario({
        nombre:
          cursoEditar.nombre || "",

        codigo:
          cursoEditar.codigo || "",

        profesor:
          cursoEditar.profesor || "",

        creditos:
          cursoEditar.creditos ??
          4,

        semestre:
          cursoEditar.semestre || "",

        color:
          cursoEditar.color ||
          "blue",

        estado,

        calificacion:
          cursoEditar.calificacion ??
          null,
      });
    } else {
      setFormulario(
        cursoInicial
      );
    }
  }, [cursoEditar]);

  const manejarCambio = (
    event
  ) => {
    const {
      name,
      value,
    } = event.target;

    setFormulario((actual) => ({
      ...actual,

      [name]:
        name === "creditos"
          ? Number(value)
          : value,
    }));
  };

  const manejarSubmit = (
    event
  ) => {
    event.preventDefault();

    if (
      !formulario.nombre.trim() ||
      !formulario.codigo.trim() ||
      !formulario.semestre.trim()
    ) {
      return;
    }

    const datosCurso = {
      ...formulario,

      nombre:
        formulario.nombre.trim(),

      codigo:
        formulario.codigo.trim(),

      profesor:
        formulario.profesor.trim(),

      creditos:
        Number(
          formulario.creditos
        ),

      semestre:
        formulario.semestre.trim(),

      calificacion:
        formulario.calificacion ===
          "" ||
        formulario.calificacion ===
          null ||
        formulario.calificacion ===
          undefined
          ? null
          : Number(
              formulario.calificacion
            ),
    };

    onGuardar(datosCurso);

    if (!cursoEditar) {
      setFormulario(
        cursoInicial
      );
    }
  };

  return (
    <form
      className="curso-form"
      onSubmit={manejarSubmit}
    >
      {/* =================================================
          HEADER
      ================================================= */}

      <div className="curso-form-header">
        <div>
          <span className="curso-form-eyebrow">
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
            Registra la información
            académica del curso.
          </p>
        </div>

        <div className="curso-form-icon">
          {cursoEditar
            ? "✎"
            : "+"}
        </div>
      </div>

      {/* =================================================
          CAMPOS
      ================================================= */}

      <div className="curso-form-grid">
        {/* NOMBRE */}

        <div className="curso-campo campo-ancho">
          <label htmlFor="nombre">
            Nombre del curso
          </label>

          <input
            id="nombre"
            name="nombre"
            type="text"
            value={
              formulario.nombre
            }
            onChange={
              manejarCambio
            }
            placeholder="Ej. Programación Web"
            required
          />
        </div>

        {/* CÓDIGO */}

        <div className="curso-campo">
          <label htmlFor="codigo">
            Código
          </label>

          <input
            id="codigo"
            name="codigo"
            type="text"
            value={
              formulario.codigo
            }
            onChange={
              manejarCambio
            }
            placeholder="Ej. INF-301"
            required
          />
        </div>

        {/* PROFESOR */}

        <div className="curso-campo">
          <label htmlFor="profesor">
            Profesor
          </label>

          <input
            id="profesor"
            name="profesor"
            type="text"
            value={
              formulario.profesor
            }
            onChange={
              manejarCambio
            }
            placeholder="Nombre del profesor"
          />
        </div>

        {/* CRÉDITOS */}

        <div className="curso-campo">
          <label htmlFor="creditos">
            Créditos
          </label>

          <input
            id="creditos"
            name="creditos"
            type="number"
            min="1"
            max="20"
            value={
              formulario.creditos
            }
            onChange={
              manejarCambio
            }
            required
          />
        </div>

        {/* SEMESTRE */}

        <div className="curso-campo">
          <label htmlFor="semestre">
            Semestre
          </label>

          <input
            id="semestre"
            name="semestre"
            type="text"
            value={
              formulario.semestre
            }
            onChange={
              manejarCambio
            }
            placeholder="Ej. III 2026"
            required
          />
        </div>

        {/* ESTADO */}

        <div className="curso-campo">
          <label htmlFor="estado">
            Estado
          </label>

          <select
            id="estado"
            name="estado"
            value={
              formulario.estado
            }
            onChange={
              manejarCambio
            }
          >
            <option value="pendiente">
              Pendiente
            </option>

            <option value="en_curso">
              En curso
            </option>

            <option value="culminado">
              Culminado
            </option>
          </select>
        </div>

        {/* COLOR */}

        <div className="curso-campo">
          <label htmlFor="color">
            Color
          </label>

          <select
            id="color"
            name="color"
            value={
              formulario.color
            }
            onChange={
              manejarCambio
            }
          >
            <option value="blue">
              Azul
            </option>

            <option value="lavender">
              Lavanda
            </option>

            <option value="ice">
              Hielo
            </option>

            <option value="steel">
              Acero
            </option>

            <option value="slate">
              Pizarra
            </option>
          </select>
        </div>
      </div>

      {/* =================================================
          AVISO DE CULMINACIÓN
      ================================================= */}

      {formulario.estado ===
        "culminado" && (
        <div className="curso-form-nota">
          <span>✓</span>

          <div>
            <strong>
              Curso culminado
            </strong>

            <p>
              Puedes guardar la calificación
              final desde la tarjeta del curso.
            </p>
          </div>
        </div>
      )}

      {/* =================================================
          ACCIONES
      ================================================= */}

      <div className="curso-form-actions">
        <button
          type="button"
          className="curso-btn-cancelar"
          onClick={onCancelar}
        >
          Cancelar
        </button>

        <button
          type="submit"
          className="curso-btn-guardar"
        >
          {cursoEditar
            ? "Guardar cambios"
            : "Agregar curso"}
        </button>
      </div>
    </form>
  );
}

export default CursosForm;