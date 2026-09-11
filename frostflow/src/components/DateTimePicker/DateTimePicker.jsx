import { useEffect, useRef, useState } from "react";

import "./DateTimePicker.css";

const MESES = [
  "enero",
  "febrero",
  "marzo",
  "abril",
  "mayo",
  "junio",
  "julio",
  "agosto",
  "septiembre",
  "octubre",
  "noviembre",
  "diciembre",
];

const DIAS_SEMANA = [
  "LU",
  "MA",
  "MI",
  "JU",
  "VI",
  "SA",
  "DO",
];

const formatearFecha = (fecha) => {
  if (!fecha) return "";

  const [fechaParte, horaParte = "00:00"] =
    fecha.split("T");

  const [anio, mes, dia] =
    fechaParte.split("-").map(Number);

  if (!anio || !mes || !dia) {
    return "";
  }

  const fechaObjeto = new Date(
    anio,
    mes - 1,
    dia
  );

  const nombreMes =
    MESES[fechaObjeto.getMonth()];

  const hora = horaParte.slice(0, 5);

  return `${dia} ${nombreMes.slice(
    0,
    3
  )}. ${anio} · ${hora}`;
};

const obtenerFechaActual = () => {
  const ahora = new Date();

  const anio = ahora.getFullYear();

  const mes = String(
    ahora.getMonth() + 1
  ).padStart(2, "0");

  const dia = String(
    ahora.getDate()
  ).padStart(2, "0");

  const hora = String(
    ahora.getHours()
  ).padStart(2, "0");

  const minutos = String(
    ahora.getMinutes()
  ).padStart(2, "0");

  return `${anio}-${mes}-${dia}T${hora}:${minutos}`;
};

const separarFecha = (valor) => {
  if (!valor) {
    const ahora = new Date();

    return {
      anio: ahora.getFullYear(),
      mes: ahora.getMonth(),
      dia: ahora.getDate(),
      hora: String(
        ahora.getHours()
      ).padStart(2, "0"),
      minutos: String(
        ahora.getMinutes()
      ).padStart(2, "0"),
    };
  }

  const [fecha, hora = "00:00"] =
    valor.split("T");

  const [anio, mes, dia] =
    fecha.split("-").map(Number);

  const [horas, minutos] =
    hora.split(":");

  return {
    anio,
    mes: mes - 1,
    dia,
    hora: horas || "00",
    minutos: minutos || "00",
  };
};

const construirValor = (
  anio,
  mes,
  dia,
  hora,
  minutos
) => {
  const mesTexto = String(
    mes + 1
  ).padStart(2, "0");

  const diaTexto = String(
    dia
  ).padStart(2, "0");

  return `${anio}-${mesTexto}-${diaTexto}T${hora}:${minutos}`;
};

function DateTimePicker({
  value,
  onChange,
  id = "fechaEntrega",
  placeholder = "Seleccionar fecha y hora",
}) {
  const pickerRef = useRef(null);

  const datosIniciales =
    separarFecha(value);

  const [abierto, setAbierto] =
    useState(false);

  const [mesVisible, setMesVisible] =
    useState(datosIniciales.mes);

  const [anioVisible, setAnioVisible] =
    useState(datosIniciales.anio);

  const [fechaSeleccionada, setFechaSeleccionada] =
    useState({
      anio: datosIniciales.anio,
      mes: datosIniciales.mes,
      dia: datosIniciales.dia,
    });

  const [hora, setHora] =
    useState(datosIniciales.hora);

  const [minutos, setMinutos] =
    useState(datosIniciales.minutos);

  useEffect(() => {
    if (!value) {
      return;
    }

    const datos = separarFecha(value);

    setFechaSeleccionada({
      anio: datos.anio,
      mes: datos.mes,
      dia: datos.dia,
    });

    setMesVisible(datos.mes);
    setAnioVisible(datos.anio);

    setHora(datos.hora);
    setMinutos(datos.minutos);
  }, [value]);

  useEffect(() => {
    const manejarClickFuera = (event) => {
      if (
        pickerRef.current &&
        !pickerRef.current.contains(
          event.target
        )
      ) {
        setAbierto(false);
      }
    };

    const manejarTecla = (event) => {
      if (
        event.key === "Escape"
      ) {
        setAbierto(false);
      }
    };

    document.addEventListener(
      "mousedown",
      manejarClickFuera
    );

    document.addEventListener(
      "keydown",
      manejarTecla
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        manejarClickFuera
      );

      document.removeEventListener(
        "keydown",
        manejarTecla
      );
    };
  }, []);

  const obtenerDiasDelMes = (
    anio,
    mes
  ) => {
    const primerDia = new Date(
      anio,
      mes,
      1
    );

    const ultimoDia = new Date(
      anio,
      mes + 1,
      0
    );

    let diaInicio =
      primerDia.getDay();

    /*
      JavaScript:
      domingo = 0
      lunes = 1

      Nosotros queremos:
      lunes = 0
      domingo = 6
    */

    diaInicio =
      diaInicio === 0
        ? 6
        : diaInicio - 1;

    const cantidadDias =
      ultimoDia.getDate();

    const diasMesAnterior =
      new Date(
        anio,
        mes,
        0
      ).getDate();

    const dias = [];

    for (
      let i = diaInicio - 1;
      i >= 0;
      i--
    ) {
      dias.push({
        dia:
          diasMesAnterior - i,
        mes:
          mes === 0
            ? 11
            : mes - 1,
        anio:
          mes === 0
            ? anio - 1
            : anio,
        otroMes: true,
      });
    }

    for (
      let dia = 1;
      dia <= cantidadDias;
      dia++
    ) {
      dias.push({
        dia,
        mes,
        anio,
        otroMes: false,
      });
    }

    const diasRestantes =
      42 - dias.length;

    for (
      let dia = 1;
      dia <= diasRestantes;
      dia++
    ) {
      dias.push({
        dia,
        mes:
          mes === 11
            ? 0
            : mes + 1,
        anio:
          mes === 11
            ? anio + 1
            : anio,
        otroMes: true,
      });
    }

    return dias;
  };

  const dias = obtenerDiasDelMes(
    anioVisible,
    mesVisible
  );

  const esSeleccionado = (
    dia
  ) => {
    return (
      fechaSeleccionada.anio ===
        dia.anio &&
      fechaSeleccionada.mes ===
        dia.mes &&
      fechaSeleccionada.dia ===
        dia.dia
    );
  };

  const esHoy = (dia) => {
    const hoy = new Date();

    return (
      hoy.getFullYear() ===
        dia.anio &&
      hoy.getMonth() ===
        dia.mes &&
      hoy.getDate() ===
        dia.dia
    );
  };

  const cambiarMes = (
    direccion
  ) => {
    if (direccion === -1) {
      if (mesVisible === 0) {
        setMesVisible(11);
        setAnioVisible(
          anioVisible - 1
        );
      } else {
        setMesVisible(
          mesVisible - 1
        );
      }
    } else {
      if (mesVisible === 11) {
        setMesVisible(0);
        setAnioVisible(
          anioVisible + 1
        );
      } else {
        setMesVisible(
          mesVisible + 1
        );
      }
    }
  };

  const seleccionarDia = (
    dia
  ) => {
    setFechaSeleccionada({
      anio: dia.anio,
      mes: dia.mes,
      dia: dia.dia,
    });

    if (dia.otroMes) {
      setMesVisible(dia.mes);
      setAnioVisible(dia.anio);
    }
  };

  const manejarHoy = () => {
    const valorActual =
      obtenerFechaActual();

    const datos =
      separarFecha(valorActual);

    setFechaSeleccionada({
      anio: datos.anio,
      mes: datos.mes,
      dia: datos.dia,
    });

    setMesVisible(datos.mes);
    setAnioVisible(datos.anio);

    setHora(datos.hora);
    setMinutos(datos.minutos);
  };

  const manejarBorrar = () => {
    onChange("");
    setAbierto(false);
  };

  const manejarAplicar = () => {
    const nuevoValor =
      construirValor(
        fechaSeleccionada.anio,
        fechaSeleccionada.mes,
        fechaSeleccionada.dia,
        hora,
        minutos
      );

    onChange(nuevoValor);
    setAbierto(false);
  };

  const manejarHora = (
    event
  ) => {
    let valor = event.target.value;

    if (valor === "") {
      valor = "00";
    }

    let numero =
      Number(valor);

    if (
      Number.isNaN(numero)
    ) {
      numero = 0;
    }

    numero = Math.min(
      23,
      Math.max(0, numero)
    );

    setHora(
      String(numero).padStart(
        2,
        "0"
      )
    );
  };

  const manejarMinutos = (
    event
  ) => {
    let valor = event.target.value;

    if (valor === "") {
      valor = "00";
    }

    let numero =
      Number(valor);

    if (
      Number.isNaN(numero)
    ) {
      numero = 0;
    }

    numero = Math.min(
      59,
      Math.max(0, numero)
    );

    setMinutos(
      String(numero).padStart(
        2,
        "0"
      )
    );
  };

  return (
    <div
      className={`datetime-picker ${
        abierto
          ? "datetime-picker-open"
          : ""
      }`}
      ref={pickerRef}
    >
      <button
        type="button"
        id={id}
        className="datetime-trigger"
        onClick={() =>
          setAbierto(
            (actual) => !actual
          )
        }
        aria-haspopup="dialog"
        aria-expanded={abierto}
      >
        <span className="datetime-trigger-icon">
          ◷
        </span>

        <span
          className={
            value
              ? "datetime-trigger-value"
              : "datetime-trigger-placeholder"
          }
        >
          {value
            ? formatearFecha(value)
            : placeholder}
        </span>

        <span className="datetime-trigger-arrow">
          ⌄
        </span>
      </button>

      {abierto && (
        <div
          className="datetime-dropdown"
          role="dialog"
          aria-label="Seleccionar fecha y hora"
        >
          {/* =================================================
              CABECERA
          ================================================= */}

          <div className="datetime-dropdown-header">
            <div>
              <span>
                FECHA Y HORA
              </span>

              <strong>
                Selecciona una fecha límite
              </strong>
            </div>

            <div className="datetime-header-icon">
              ◷
            </div>
          </div>

          {/* =================================================
              CALENDARIO
          ================================================= */}

          <div className="datetime-calendar">
            <div className="calendar-navigation">
              <button
                type="button"
                onClick={() =>
                  cambiarMes(-1)
                }
                aria-label="Mes anterior"
              >
                ‹
              </button>

              <div className="calendar-month">
                <strong>
                  {MESES[
                    mesVisible
                  ]}
                </strong>

                <span>
                  {anioVisible}
                </span>
              </div>

              <button
                type="button"
                onClick={() =>
                  cambiarMes(1)
                }
                aria-label="Mes siguiente"
              >
                ›
              </button>
            </div>

            <div className="calendar-weekdays">
              {DIAS_SEMANA.map(
                (dia) => (
                  <span
                    key={dia}
                  >
                    {dia}
                  </span>
                )
              )}
            </div>

            <div className="calendar-days">
              {dias.map(
                (dia, index) => (
                  <button
                    type="button"
                    key={`${dia.anio}-${dia.mes}-${dia.dia}-${index}`}
                    className={[
                      "calendar-day",
                      dia.otroMes
                        ? "calendar-day-other"
                        : "",
                      esSeleccionado(
                        dia
                      )
                        ? "calendar-day-selected"
                        : "",
                      esHoy(dia)
                        ? "calendar-day-today"
                        : "",
                    ]
                      .filter(
                        Boolean
                      )
                      .join(" ")}
                    onClick={() =>
                      seleccionarDia(
                        dia
                      )
                    }
                  >
                    {dia.dia}
                  </button>
                )
              )}
            </div>
          </div>

          {/* =================================================
              HORA
          ================================================= */}

          <div className="datetime-time">
            <div className="datetime-section-label">
              <span>
                HORA
              </span>

              <small>
                Formato de 24 horas
              </small>
            </div>

            <div className="time-controls">
              <div className="time-input-group">
                <input
                  type="number"
                  min="0"
                  max="23"
                  value={hora}
                  onChange={
                    manejarHora
                  }
                  aria-label="Hora"
                />

                <span>
                  hora
                </span>
              </div>

              <strong>:</strong>

              <div className="time-input-group">
                <input
                  type="number"
                  min="0"
                  max="59"
                  value={minutos}
                  onChange={
                    manejarMinutos
                  }
                  aria-label="Minutos"
                />

                <span>
                  min
                </span>
              </div>
            </div>
          </div>

          {/* =================================================
              ACCIONES
          ================================================= */}

          <div className="datetime-actions">
            <button
              type="button"
              className="datetime-action-link"
              onClick={manejarBorrar}
            >
              Borrar
            </button>

            <button
              type="button"
              className="datetime-action-today"
              onClick={manejarHoy}
            >
              Hoy
            </button>

            <button
              type="button"
              className="datetime-action-cancel"
              onClick={() =>
                setAbierto(false)
              }
            >
              Cancelar
            </button>

            <button
              type="button"
              className="datetime-action-apply"
              onClick={
                manejarAplicar
              }
            >
              Aplicar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default DateTimePicker;