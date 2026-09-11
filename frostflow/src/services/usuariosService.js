const API_URL = "http://localhost:3001";

export const getUsuarios = async () => {
  const response = await fetch(`${API_URL}/usuarios`);

  if (!response.ok) {
    throw new Error("No se pudieron obtener los usuarios.");
  }

  return await response.json();
};

export const loginUsuario = async (email, password) => {
  const response = await fetch(`${API_URL}/usuarios`);

  if (!response.ok) {
    throw new Error("No se pudo realizar el inicio de sesión.");
  }

  const usuarios = await response.json();

  const usuarioEncontrado = usuarios.find(
    (usuario) =>
      usuario.email.toLowerCase().trim() === email.toLowerCase().trim() &&
      usuario.password === password
  );

  if (!usuarioEncontrado) {
    throw new Error("Correo o contraseña incorrectos.");
  }

  return {
    id: usuarioEncontrado.id,
    nombre: usuarioEncontrado.nombre,
    email: usuarioEncontrado.email,
  };
};