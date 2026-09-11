const MILISEGUNDOS_POR_DIA =
  1000 * 60 * 60 * 24;

const obtenerInicioDelDia = (fecha) => {
  const resultado = new Date(fecha);

  resultado.setHours(0, 0, 0, 0);

  return resultado;
};

export const obtenerDiasRestantes = (
  fechaEntrega
) => {
  if (!fechaEntrega) {
    return null;
  }

  const ahora = new Date();
  const fecha = new Date(fechaEntrega);

  if (Number.isNaN(fecha.getTime())) {
    return null;
  }

  const hoy = obtenerInicioDelDia(ahora);
  const diaEntrega = obtenerInicioDelDia(fecha);

  const diferencia =
    diaEntrega.getTime() - hoy.getTime();

  return Math.round(
    diferencia / MILISEGUNDOS_POR_DIA
  );
};

export const obtenerTemperatura = (
  fechaEntrega,
  estado
) => {
  if (estado === "completada") {
    return "completada";
  }

  const diasRestantes =
    obtenerDiasRestantes(fechaEntrega);

  if (diasRestantes === null) {
    return "estable";
  }

  if (diasRestantes < 0) {
    return "vencido";
  }

  if (diasRestantes === 0) {
    return "critico";
  }

  if (diasRestantes <= 3) {
    return "urgente";
  }

  if (diasRestantes <= 7) {
    return "proximo";
  }

  return "estable";
};

export const calcularRiesgo = (
  fechaEntrega,
  progreso = 0,
  estado
) => {
  if (estado === "completada") {
    return 0;
  }

  const temperatura =
    obtenerTemperatura(
      fechaEntrega,
      estado
    );

  const riesgoBase = {
    estable: 15,
    proximo: 35,
    urgente: 55,
    critico: 82,
    vencido: 100,
  };

  const base =
    riesgoBase[temperatura] ?? 15;

  const progresoSeguro = Math.min(
    100,
    Math.max(
      0,
      Number(progreso) || 0
    )
  );

  const penalizacion =
    (100 - progresoSeguro) * 0.25;

  return Math.min(
    100,
    Math.round(
      base + penalizacion
    )
  );
};

export const calcularEstadoAcademico = (
  entrega
) => {
  const temperatura =
    obtenerTemperatura(
      entrega.fechaEntrega,
      entrega.estado
    );

  const riesgo =
    calcularRiesgo(
      entrega.fechaEntrega,
      entrega.progreso,
      entrega.estado
    );

  return {
    temperatura,
    riesgo,
  };
};