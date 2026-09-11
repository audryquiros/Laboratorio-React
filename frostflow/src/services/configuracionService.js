import { apiFetch } from "./api";

export const getConfiguracion = async () => {
  return await apiFetch("/configuracion");
};

export const getConfiguracionActual =
  async () => {
    const configuraciones =
      await getConfiguracion();

    return configuraciones[0] || null;
  };

export const updateConfiguracion = async (
  id,
  configuracion
) => {
  return await apiFetch(
    `/configuracion/${id}`,
    {
      method: "PATCH",
      body: JSON.stringify(
        configuracion
      ),
    }
  );
};