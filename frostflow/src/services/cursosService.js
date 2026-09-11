import { apiFetch } from "./api";

export const getCursos = async () => {
  return await apiFetch("/cursos");
};

export const getCursoById = async (id) => {
  return await apiFetch(`/cursos/${id}`);
};

export const createCurso = async (curso) => {
  return await apiFetch("/cursos", {
    method: "POST",
    body: JSON.stringify(curso),
  });
};

export const updateCurso = async (
  id,
  curso
) => {
  return await apiFetch(`/cursos/${id}`, {
    method: "PATCH",
    body: JSON.stringify(curso),
  });
};

export const deleteCurso = async (id) => {
  await apiFetch(`/cursos/${id}`, {
    method: "DELETE",
  });

  return true;
};