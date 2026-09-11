import { apiFetch } from "./api";

export const getEjecuciones = async () => {
  return await apiFetch("/ejecuciones");
};

export const getEjecucionById = async (
  id
) => {
  return await apiFetch(
    `/ejecuciones/${id}`
  );
};

export const createEjecucion = async (
  ejecucion
) => {
  return await apiFetch("/ejecuciones", {
    method: "POST",
    body: JSON.stringify(ejecucion),
  });
};

export const updateEjecucion = async (
  id,
  ejecucion
) => {
  return await apiFetch(
    `/ejecuciones/${id}`,
    {
      method: "PATCH",
      body: JSON.stringify(ejecucion),
    }
  );
};