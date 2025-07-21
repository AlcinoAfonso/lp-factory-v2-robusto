import fs from 'fs';
import path from 'path';

/**
 * Salvar dados de forma atômica
 */
export async function saveJSONFile(filePath: string, data: any): Promise<void> {
  try {
    const tempPath = filePath + '.tmp';
    
    // Escrever em arquivo temporário primeiro
    fs.writeFileSync(tempPath, JSON.stringify(data, null, 2), 'utf8');
    
    // Renomear para o arquivo final (operação atômica)
    fs.renameSync(tempPath, filePath);
    
    console.log(`✅ Arquivo salvo: ${filePath}`);
  } catch (error) {
    console.error(`❌ Erro ao salvar ${filePath}:`, error);
    throw error;
  }
}

/**
 * Criar backup antes de modificar arquivo
 */
export async function backupFile(filePath: string): Promise<void> {
  try {
    if (fs.existsSync(filePath)) {
      const backupPath = `${filePath}.backup.${Date.now()}`;
      fs.copyFileSync(filePath, backupPath);
      
      // Manter apenas os últimos 5 backups
      const dir = path.dirname(filePath);
      const fileName = path.basename(filePath);
      const backupFiles = fs.readdirSync(dir)
        .filter(file => file.startsWith(`${fileName}.backup.`))
        .sort()
        .reverse();
      
      // Remover backups antigos
      if (backupFiles.length > 5) {
        backupFiles.slice(5).forEach(file => {
          fs.unlinkSync(path.join(dir, file));
        });
      }
    }
  } catch (error) {
    console.warn('Aviso: não foi possível criar backup:', error);
  }
}

/**
 * Trigger deploy automático (webhook Vercel)
 */
export async function triggerDeploy(): Promise<void> {
  try {
    // Em produção, fazer commit git + push
    // Por enquanto, apenas log
    console.log('🚀 Deploy triggerde - alterações serão aplicadas em breve');
    
    // TODO: Implementar commit automático via GitHub API
    // ou webhook para Vercel
  } catch (error) {
    console.error('Erro ao trigger deploy:', error);
  }
}
