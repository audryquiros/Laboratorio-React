const API_URL = "http://localhost:3001";

export const getConfiguracion = async () => {
  const response = await fetch(`${API_URL}/configuracion`);

  if (!response.ok) {
    throw new Error("No se pudo obtener la configuración.");
  }

  return await response.json();
};

export const updateConfiguracion = async (id, configuracion) => {
  const response = await fetch(`${API_URL}/configuracion/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(configuracion)
  });

  if (!response.ok) {
    throw new Error("No se pudo actualizar la configuración.");
  }

  return await response.json();
};