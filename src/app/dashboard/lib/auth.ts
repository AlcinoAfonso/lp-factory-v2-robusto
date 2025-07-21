// ✅ VERSÃO SIMPLIFICADA - Apenas para uso server-side

/**
 * Verificar se cliente está autenticado (server-side only)
 */
export async function isClientAuthenticated(clientId: string): Promise<boolean> {
  try {
    // Lógica básica de validação
    // Em produção, verificar JWT token ou session store
    const validClients = ['fitnutri', 'unico-digital'];
    return validClients.includes(clientId);
  } catch (error) {
    console.error('Erro ao verificar autenticação:', error);
    return false;
  }
}
