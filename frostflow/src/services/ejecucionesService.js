const API_URL = "http://localhost:3001";

export const getEjecuciones = async () => {
  const response = await fetch(`${API_URL}/ejecuciones`);

  if (!response.ok) {
    throw new Error("No se pudieron obtener las ejecuciones.");
  }

  return await response.json();
};

export const createEjecucion = async (ejecucion) => {
  const response = await fetch(`${API_URL}/ejecuciones`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(ejecucion)
  });

  if (!response.ok) {
    throw new Error("No se pudo registrar la ejecución.");
  }

  return await response.json();
};