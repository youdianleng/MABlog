/** Translate API failures for the selected interface language without changing server error contracts. */
export function localizedError(message: string): string {
  if (
    typeof window === "undefined" ||
    localStorage.getItem("mablog-language") !== "es"
  )
    return message;
  const messages: Record<string, string> = {
    "Email not found": "Correo electrónico no encontrado",
    "Email or username already registered":
      "El correo o nombre de usuario ya está registrado",
    "Invalid login or password": "Usuario o contraseña incorrectos",
    "Please sign in and verify your email":
      "Inicia sesión y verifica tu correo",
    "Too many requests. Please wait and try again.":
      "Demasiadas solicitudes. Espera y vuelve a intentarlo.",
    "Wait 60 seconds before requesting another code":
      "Espera 60 segundos antes de solicitar otro código",
    "Local email inbox is unavailable":
      "El buzón de correo local no está disponible",
    "Code expired or unavailable. Request a new code.":
      "El código ha caducado o no está disponible. Solicita uno nuevo.",
    "Incorrect verification code": "Código de verificación incorrecto",
    "A new password is required": "Se necesita una nueva contraseña",
    "Invalid request origin": "Origen de solicitud no válido",
    "Invalid document: check block dimensions and content limits":
      "Documento no válido: revisa las dimensiones y los límites de contenido",
    "This record already exists; refresh and try again":
      "Este registro ya existe; actualiza y vuelve a intentarlo",
    "Media is not available for this post":
      "El archivo no está disponible para esta publicación",
    "Choose an uploaded cover image": "Elige una imagen de portada subida",
    "Cover must be an image": "La portada debe ser una imagen",
    "Public posts require a title and uploaded cover image":
      "Las publicaciones públicas necesitan título e imagen de portada",
    "Only public posts can be liked":
      "Solo puedes dar me gusta a publicaciones públicas",
    "Choose another account and a valid access role":
      "Elige otra cuenta y un permiso válido",
    "Save a draft first": "Guarda un borrador primero",
    "This target changed. Review the current version before saving.":
      "Este elemento ha cambiado. Revisa la versión actual antes de guardar.",
    "Proposal is no longer pending": "La propuesta ya no está pendiente",
    "Current content changed; compare the versions again":
      "El contenido actual ha cambiado; compara las versiones otra vez",
    "Choose approve or reject": "Elige aprobar o rechazar",
    "Profile not found": "Perfil no encontrado",
    "Post not found": "Publicación no encontrada",
    "This action requires the creator or an allowed editor":
      "Esta acción requiere al creador o a un editor autorizado",
    "Choose your uploaded avatar image": "Elige tu imagen de perfil subida",
    "Unsupported media format": "Formato de archivo no compatible",
    "File exceeds the upload size limit":
      "El archivo supera el límite de tamaño",
    "Image contents do not match its format":
      "El contenido de la imagen no coincide con su formato",
    "Invalid video container": "Contenedor de vídeo no válido",
    "File could not be validated": "No se pudo validar el archivo",
    "Media not found": "Archivo no encontrado",
    "Duplicate block identifiers": "Identificadores de bloque duplicados",
  };
  return messages[message] || message;
}
