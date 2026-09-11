const API_URL = "http://localhost:3001";

export const getAlertas = async () => {
  const response = await fetch(`${API_URL}/alertas`);

  if (!response.ok) {
    throw new Error("No se pudieron obtener las alertas.");
  }

  return await response.json();
};

export const createAlerta = async (alerta) => {
  const response = await fetch(`${API_URL}/alertas`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(alerta)
  });

  if (!response.ok) {
    throw new Error("No se pudo crear la alerta.");
  }

  return await response.json();
};

export const updateAlerta = async (id, alerta) => {
  const response = await fetch(`${API_URL}/alertas/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(alerta)
  });

  if (!response.ok) {
    throw new Error("No se pudo actualizar la alerta.");
  }

  return await response.json();
};