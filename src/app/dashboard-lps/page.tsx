// 🆕 NOVO SISTEMA: Escanear LPs baseado no domain.json
function scanNewSystemLPs(clientName: string, domainConfig: any): LP[] {
  const lps: LP[] = [];
  
  try {
    const lpsConfig = domainConfig.lps || {};
    const homepage = domainConfig.homepage;
    
    console.log(`🔍 [DASHBOARD] Escaneando ${clientName}:`, Object.keys(lpsConfig));
    
    for (const [lpKey, lpData] of Object.entries(lpsConfig)) {
      const lpConfig = lpData as any;
      
      console.log(`📄 [DASHBOARD] Processando LP: ${lpKey}`, lpConfig);
      
      // Verificar se pasta da LP existe
      const lpFolder = lpConfig.folder === '.' ? '' : lpConfig.folder;
      const lpPath = path.join(process.cwd(), 'src/app', clientName, lpFolder);
      const pageFile = path.join(lpPath, 'page.tsx');
      
      console.log(`📁 [DASHBOARD] Verificando: ${pageFile}`);
      console.log(`📁 [DASHBOARD] Existe: ${fs.existsSync(pageFile)}`);
      
      if (fs.existsSync(pageFile)) {
        // Determinar URL baseada no slug
        const slug = lpConfig.slug || '';
        const isHomepage = lpKey === homepage;
        
        // ✅ CORREÇÃO: URL deve ser baseada no slug, não na pasta
        const lpUrl = slug ? `/${clientName}/${slug}` : `/${clientName}`;
        
        const newLP: LP = {
          name: lpConfig.title || lpKey,
          path: lpFolder ? `${clientName}/${lpFolder}` : clientName,
          url: lpUrl,
          type: isHomepage ? 'principal' : 'secundaria',
          title: lpConfig.title
        };
        
        console.log(`✅ [DASHBOARD] LP adicionada:`, newLP);
        lps.push(newLP);
      } else {
        console.log(`❌ [DASHBOARD] Page.tsx não encontrado para ${lpKey}`);
      }
    }
    
    console.log(`📊 [DASHBOARD] Total LPs encontradas para ${clientName}:`, lps.length);
  } catch (error) {
    console.warn(`❌ [DASHBOARD] Erro ao escanear LPs do novo sistema (${clientName}):`, error);
  }
  
  return lps;
}
