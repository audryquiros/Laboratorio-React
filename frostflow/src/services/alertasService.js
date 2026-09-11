import { apiFetch } from "./api";

export const getAlertas = async () => {
  return await apiFetch("/alertas");
};

export const getAlertaById = async (id) => {
  return await apiFetch(`/alertas/${id}`);
};

export const createAlerta = async (
  alerta
) => {
  return await apiFetch("/alertas", {
    method: "POST",
    body: JSON.stringify(alerta),
  });
};

export const updateAlerta = async (
  id,
  alerta
) => {
  return await apiFetch(`/alertas/${id}`, {
    method: "PATCH",
    body: JSON.stringify(alerta),
  });
};

export const deleteAlerta = async (id) => {
  await apiFetch(`/alertas/${id}`, {
    method: "DELETE",
  });

  return true;
};

export const marcarAlertaComoLeida =
  async (id) => {
    return await updateAlerta(id, {
      leida: true,
    });
  };