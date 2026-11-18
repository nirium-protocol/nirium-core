/**
 * Registro de eventos del dashboard (crear, depositar, cerrar bóveda...).
 *
 * Antes mandaba cada evento a POST /api/logs, que lo escribía en el feed público
 * (agent_logs) sin autenticación: cualquiera podía publicar ahí un mensaje con el
 * agent_id que quisiera, y estas líneas, escritas por el navegador, aparecían junto
 * a las del agente como si fueran suyas. Desde el 8-nov-2026 se quedan en la
 * consola del navegador; lo verificable de cada acción es su tx en la cadena.
 */
export async function writeLog(
    message: string,
    level: 'info' | 'warn' | 'error' | 'success' | 'system' = 'info',
    agentId?: string
) {
    const line = `[${agentId || 'UI_CLIENT'}] ${message}`;
    if (level === 'error') console.error(line);
    else if (level === 'warn') console.warn(line);
    else console.info(line);
}
