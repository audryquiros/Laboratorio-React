const API_URL = "http://localhost:3001";

export const getEntregas = async () => {
  const response = await fetch(`${API_URL}/entregas`);

  if (!response.ok) {
    throw new Error("No se pudieron obtener las entregas.");
  }

  return await response.json();
};

export const getEntregaById = async (id) => {
  const response = await fetch(`${API_URL}/entregas/${id}`);

  if (!response.ok) {
    throw new Error("No se pudo obtener la entrega.");
  }

  return await response.json();
};

export const createEntrega = async (entrega) => {
  const response = await fetch(`${API_URL}/entregas`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(entrega)
  });

  if (!response.ok) {
    throw new Error("No se pudo crear la entrega.");
  }

  return await response.json();
};

export const updateEntrega = async (id, entrega) => {
  const response = await fetch(`${API_URL}/entregas/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(entrega)
  });

  if (!response.ok) {
    throw new Error("No se pudo actualizar la entrega.");
  }

  return await response.json();
};

export const deleteEntrega = async (id) => {
  const response = await fetch(`${API_URL}/entregas/${id}`, {
    method: "DELETE"
  });

  if (!response.ok) {
    throw new Error("No se pudo eliminar la entrega.");
  }

  return true;
};