import { apiFetch } from "./api";

export const getUsuarios = async () => {
  return await apiFetch("/usuarios");
};

export const loginUsuario = async (
  email,
  password
) => {
  const usuarios =
    await getUsuarios();

  const usuarioEncontrado =
    usuarios.find(
      (usuario) =>
        usuario.email
          .toLowerCase()
          .trim() ===
          email.toLowerCase().trim() &&
        usuario.password === password
    );

  if (!usuarioEncontrado) {
    throw new Error(
      "Correo o contraseña incorrectos."
    );
  }

  return {
    id: usuarioEncontrado.id,
    nombre: usuarioEncontrado.nombre,
    email: usuarioEncontrado.email,
  };
};