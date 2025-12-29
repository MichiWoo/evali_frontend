/**
 * Formatea una fecha Date a string en formato ISO pero preservando la hora local
 * sin convertir a UTC. Esto es necesario para enviar fechas al backend que
 * espera recibir la hora en la zona horaria local de la aplicación.
 *
 * @param date - La fecha Date a formatear
 * @returns String en formato YYYY-MM-DDTHH:mm:ss (sin zona horaria)
 */
export function formatDateToLocalISO(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  const seconds = String(date.getSeconds()).padStart(2, '0')

  return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`
}

/**
 * Formatea una fecha Date a string en formato ISO con milisegundos pero preservando la hora local
 *
 * @param date - La fecha Date a formatear
 * @returns String en formato YYYY-MM-DDTHH:mm:ss.SSS (sin zona horaria)
 */
export function formatDateToLocalISOWithMs(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  const seconds = String(date.getSeconds()).padStart(2, '0')
  const milliseconds = String(date.getMilliseconds()).padStart(3, '0')

  return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}.${milliseconds}`
}
