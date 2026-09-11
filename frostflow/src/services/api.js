const API_URL =
  import.meta.env.VITE_API_URL ||
  "http://localhost:3001";

export const apiFetch = async (
  endpoint,
  options = {}
) => {
  const response = await fetch(
    `${API_URL}${endpoint}`,
    {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(options.headers || {}),
      },
    }
  );

  let data = null;

  try {
    data = await response.json();
  } catch {
    data = null;
  }

  if (!response.ok) {
    const mensaje =
      data?.message ||
      data?.error ||
      "Ocurrió un error al comunicarse con el servidor.";

    throw new Error(mensaje);
  }

  return data;
};

export { API_URL };