import { apiFetch } from "./api";

export const getEntregas = async () => {
  return await apiFetch("/entregas");
};

export const getEntregaById = async (id) => {
  return await apiFetch(`/entregas/${id}`);
};

export const createEntrega = async (
  entrega
) => {
  return await apiFetch("/entregas", {
    method: "POST",
    body: JSON.stringify(entrega),
  });
};

export const updateEntrega = async (
  id,
  entrega
) => {
  return await apiFetch(`/entregas/${id}`, {
    method: "PATCH",
    body: JSON.stringify(entrega),
  });
};

export const deleteEntrega = async (id) => {
  await apiFetch(`/entregas/${id}`, {
    method: "DELETE",
  });

  return true;
};