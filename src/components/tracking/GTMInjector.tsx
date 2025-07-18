'use client';

import { useEffect } from 'react';

interface GTMSnippet {
  head: string;
  body: string;
}

interface GTMInjectorProps {
  snippet: GTMSnippet;
}

export function GTMInjector({ snippet }: GTMInjectorProps) {
  useEffect(() => {
    // Validação XSS básica
    if (!isValidGTMSnippet(snippet.head) || !isValidGTMSnippet(snippet.body)) {
      console.error('🚨 GTMInjector: Snippet GTM inválido - possível risco de segurança');
      return;
    }

    // Injetar head snippet
    if (snippet.head && !document.querySelector('[data-gtm-head]')) {
      const headScript = document.createElement('div');
      headScript.innerHTML = snippet.head;
      headScript.setAttribute('data-gtm-head', 'true');
      document.head.appendChild(headScript.firstElementChild as Element);
      console.info('✅ GTM Head snippet injetado');
    }

    // Injetar body snippet
    if (snippet.body && !document.querySelector('[data-gtm-body]')) {
      const bodyScript = document.createElement('div');
      bodyScript.innerHTML = snippet.body;
      bodyScript.setAttribute('data-gtm-body', 'true');
      document.body.appendChild(bodyScript.firstElementChild as Element);
      console.info('✅ GTM Body snippet injetado');
    }
  }, [snippet]);

  return null; // Componente só para efeitos colaterais
}

function isValidGTMSnippet(snippet: string): boolean {
  if (!snippet || typeof snippet !== 'string') return false;
  
  // Validação básica: deve conter tags esperadas e não conter scripts maliciosos
  const hasValidTags = (
    (snippet.includes('<script') && snippet.includes('</script>')) ||
    (snippet.includes('<noscript') && snippet.includes('</noscript>'))
  );
  
  // Lista negra básica
  const hasBlockedContent = snippet.toLowerCase().includes('javascript:') ||
                           snippet.includes('onerror') ||
                           snippet.includes('onload');
  
  return hasValidTags && !hasBlockedContent;
}
