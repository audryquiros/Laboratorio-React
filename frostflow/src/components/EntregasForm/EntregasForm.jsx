import { useEffect, useState } from "react";

import DateTimePicker from "../DateTimePicker/DateTimePicker";

import "./EntregasForm.css";

const entregaInicial = {
  titulo: "",
  cursoId: "",
  descripcion: "",
  fechaEntrega: "",
  progreso: 0,
  estado: "en_progreso",
};

function EntregasForm({
  cursos,
  entregaEditar,
  onGuardar,
  onCancelar,
}) {
  const [formulario, setFormulario] =
    useState(entregaInicial);

  useEffect(() => {
    if (entregaEditar) {
      const fecha =
        entregaEditar.fechaEntrega
          ? entregaEditar.fechaEntrega.slice(
              0,
              16
            )
          : "";

      setFormulario({
        titulo:
          entregaEditar.titulo || "",

        cursoId:
          entregaEditar.cursoId || "",

        descripcion:
          entregaEditar.descripcion || "",

        fechaEntrega: fecha,

        progreso:
          entregaEditar.progreso ?? 0,

        estado:
          entregaEditar.estado ||
          "en_progreso",
      });
    } else {
      setFormulario(
        entregaInicial
      );
    }
  }, [entregaEditar]);

  const manejarCambio = (e) => {
    const {
      name,
      value,
    } = e.target;

    setFormulario((actual) => ({
      ...actual,

      [name]:
        name === "progreso"
          ? Number(value)
          : name === "cursoId"
          ? Number(value)
          : value,
    }));
  };

  const manejarFecha = (
    nuevaFecha
  ) => {
    setFormulario((actual) => ({
      ...actual,
      fechaEntrega: nuevaFecha,
    }));
  };

  const manejarSubmit = (e) => {
    e.preventDefault();

    if (
      !formulario.titulo.trim() ||
      !formulario.cursoId ||
      !formulario.fechaEntrega
    ) {
      return;
    }

    const datosEntrega = {
      ...formulario,

      cursoId: Number(
        formulario.cursoId
      ),

      progreso: Number(
        formulario.progreso
      ),

      fechaEntrega:
        formulario.fechaEntrega,
    };

    onGuardar(datosEntrega);

    if (!entregaEditar) {
      setFormulario(
        entregaInicial
      );
    }
  };

  return (
    <form
      className="entrega-form"
      onSubmit={manejarSubmit}
    >
      {/* =================================================
          HEADER
      ================================================= */}

      <div className="entrega-form-header">
        <div>
          <span className="entrega-form-eyebrow">
            {entregaEditar
              ? "Editar entrega"
              : "Nueva entrega"}
          </span>

          <h2>
            {entregaEditar
              ? "Actualizar entrega"
              : "Agregar entrega"}
          </h2>

          <p>
            Vincula la actividad con un
            curso y establece su fecha
            límite.
          </p>
        </div>

        <div className="entrega-form-icon">
          {entregaEditar
            ? "✎"
            : "□"}
        </div>
      </div>

      {/* =================================================
          CAMPOS
      ================================================= */}

      <div className="entrega-form-grid">
        {/* TÍTULO */}

        <div className="entrega-campo entrega-campo-ancho">
          <label htmlFor="titulo">
            Título de la entrega
          </label>

          <input
            id="titulo"
            name="titulo"
            type="text"
            value={
              formulario.titulo
            }
            onChange={
              manejarCambio
            }
            placeholder="Ej. Proyecto final"
            required
          />
        </div>

        {/* CURSO */}

        <div className="entrega-campo">
          <label htmlFor="cursoId">
            Curso
          </label>

          <select
            id="cursoId"
            name="cursoId"
            value={
              formulario.cursoId
            }
            onChange={
              manejarCambio
            }
            required
          >
            <option value="">
              Seleccionar curso
            </option>

            {cursos.map(
              (curso) => (
                <option
                  key={curso.id}
                  value={curso.id}
                >
                  {curso.codigo} —{" "}
                  {curso.nombre}
                </option>
              )
            )}
          </select>
        </div>

        {/* DESCRIPCIÓN */}

        <div className="entrega-campo entrega-campo-ancho">
          <label htmlFor="descripcion">
            Descripción
          </label>

          <textarea
            id="descripcion"
            name="descripcion"
            value={
              formulario.descripcion
            }
            onChange={
              manejarCambio
            }
            placeholder="Describe brevemente qué debes realizar..."
            rows="4"
          />
        </div>

        {/* FECHA */}

        <div className="entrega-campo">
          <label htmlFor="fechaEntrega">
            Fecha y hora límite
          </label>

          <DateTimePicker
            id="fechaEntrega"
            value={
              formulario.fechaEntrega
            }
            onChange={
              manejarFecha
            }
          />
        </div>

        {/* PROGRESO */}

        <div className="entrega-campo">
          <label htmlFor="progreso">
            Progreso —{" "}
            {formulario.progreso}%
          </label>

          <div className="progreso-control">
            <input
              id="progreso"
              name="progreso"
              type="range"
              min="0"
              max="100"
              step="5"
              value={
                formulario.progreso
              }
              onChange={
                manejarCambio
              }
            />

            <span>
              {formulario.progreso}%
            </span>
          </div>
        </div>

        {/* ESTADO */}

        <div className="entrega-campo">
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
            <option value="en_progreso">
              En progreso
            </option>

            <option value="pendiente">
              Pendiente
            </option>

            <option value="completada">
              Completada
            </option>
          </select>
        </div>
      </div>

      {/* =================================================
          ACCIONES
      ================================================= */}

      <div className="entrega-form-actions">
        <button
          type="button"
          className="entrega-btn-secundario"
          onClick={onCancelar}
        >
          Cancelar
        </button>

        <button
          type="submit"
          className="entrega-btn-guardar"
        >
          {entregaEditar
            ? "Guardar cambios"
            : "Agregar entrega"}
        </button>
      </div>
    </form>
  );
}

export default EntregasForm;