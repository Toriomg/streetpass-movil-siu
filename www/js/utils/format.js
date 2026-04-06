export function formatearTelefono(telefono) {
  // Eliminar cualquier carácter que no sea un número
  const numLimpios = telefono.replace(/\D/g, "");

  // Verificar que tenga la longitud correcta (11 dígitos: 2 prefijo + 9 número)
  if (numLimpios.length !== 9) {
    return "Número inválido (debe tener 11 dígitos)";
  }

  // expresión regular para capturar los grupos
  // (\d{2}) -> El prefijo
  // (\d{3}) -> Primer bloque de 3
  // (\d{2})(\d{2})(\d{2}) -> Tres bloques de 2
  const formato = numLimpios.replace(
    /^(\d{3})(\d{2})(\d{2})(\d{2})$/,
    "+34 $1 $2 $3 $4",
  );

  return formato;
}