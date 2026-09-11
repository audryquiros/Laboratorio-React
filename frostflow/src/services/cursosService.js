const API_URL = "http://localhost:3001";

export const getCursos = async () => {
  const response = await fetch(`${API_URL}/cursos`);

  if (!response.ok) {
    throw new Error("No se pudieron obtener los cursos.");
  }

  return await response.json();
};

export const getCursoById = async (id) => {
  const response = await fetch(`${API_URL}/cursos/${id}`);

  if (!response.ok) {
    throw new Error("No se pudo obtener el curso.");
  }

  return await response.json();
};

export const createCurso = async (curso) => {
  const response = await fetch(`${API_URL}/cursos`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(curso)
  });

  if (!response.ok) {
    throw new Error("No se pudo crear el curso.");
  }

  return await response.json();
};

export const updateCurso = async (id, curso) => {
  const response = await fetch(`${API_URL}/cursos/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(curso)
  });

  if (!response.ok) {
    throw new Error("No se pudo actualizar el curso.");
  }

  return await response.json();
};

export const deleteCurso = async (id) => {
  const response = await fetch(`${API_URL}/cursos/${id}`, {
    method: "DELETE"
  });

  if (!response.ok) {
    throw new Error("No se pudo eliminar el curso.");
  }

  return true;
};