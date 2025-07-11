import { redirect } from 'next/navigation';

// 🎯 FASE 1 - TAREFA 1: Eliminar conflito de roteamento
// Redirect direto para dashboard, removendo seletor de clientes
export default function HomePage() {
  // Redirect 307 (Temporary) para manter SEO
  redirect('/dashboard-lps');
}
