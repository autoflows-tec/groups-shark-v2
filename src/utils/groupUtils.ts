export const formatDate = (dateString: string | null) => {
  if (!dateString) return "Data não disponível";
  
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      return dateString;
    }
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch {
    return dateString || "Data não disponível";
  }
};

export const isMessageFromToday = (dateString: string | null) => {
  if (!dateString) return false;
  
  try {
    const messageDate = new Date(dateString);
    const today = new Date();
    
    return messageDate.toDateString() === today.toDateString();
  } catch {
    return false;
  }
};

export const getStatusType = (status: string | null, resumo: string | null, totalMensagens?: number) => {
  // PRIORIDADE 1: Se não há mensagens E não há análise manual, considerar sem mensagens
  if (totalMensagens === 0 && (!status || status.trim() === '') && (!resumo || resumo.trim() === '')) {
    return 'sem-mensagens';
  }
  
  // PRIORIDADE 2: Se não há dados de análise (mesmo com mensagens), considerar sem dados
  if ((!status || status.trim() === '') && (!resumo || resumo.trim() === '')) {
    return 'sem-mensagens';
  }
  
  const statusLower = (status || '').toLowerCase();
  const resumoLower = (resumo || '').toLowerCase();
  
  // Verificar se é "sem mensagens" explicitamente
  if (statusLower.includes('sem mensagens') || statusLower.includes('sem mensagem') ||
      resumoLower.includes('sem mensagens') || resumoLower.includes('sem mensagem')) {
    return 'sem-mensagens';
  }
  
  // Verificar se é crítico (palavras que indicam problemas)
  if (statusLower.includes('crítico') || statusLower.includes('critico') || 
      statusLower.includes('problema') || statusLower.includes('erro') ||
      resumoLower.includes('crítico') || resumoLower.includes('critico') ||
      resumoLower.includes('problema') || resumoLower.includes('erro')) {
    return 'critico';
  }
  
  // Verificar se é alerta (pendências, dificuldades) - incluir valor exato do banco
  if (statusLower.includes('alerta') || statusLower === 'alerta' ||
      statusLower.includes('warning') ||
      statusLower.includes('pendência') || statusLower.includes('pendencia') ||
      statusLower.includes('dificuldade') || statusLower.includes('aguardando') ||
      resumoLower.includes('alerta') || resumoLower.includes('warning') ||
      resumoLower.includes('pendência') || resumoLower.includes('pendencia') ||
      resumoLower.includes('dificuldade') || resumoLower.includes('aguardando')) {
    return 'alerta';
  }
  
  // Verificar se é estável (feedback positivo explícito) - incluir valor exato do banco
  if (statusLower.includes('estável') || statusLower === 'estável' || 
      statusLower.includes('estavel') || statusLower === 'estavel' ||
      statusLower.includes('ativo') || statusLower.includes('ok') ||
      statusLower.includes('positivo') || statusLower.includes('bom') ||
      statusLower.includes('satisfatório') || statusLower.includes('aprovado') ||
      resumoLower.includes('estável') || resumoLower.includes('estavel') ||
      resumoLower.includes('ativo') || resumoLower.includes('ok') ||
      resumoLower.includes('positivo') || resumoLower.includes('bom') ||
      resumoLower.includes('satisfatório') || resumoLower.includes('aprovado') ||
      resumoLower.includes('cordial') || resumoLower.includes('colaborativo') ||
      resumoLower.includes('produtivo') || resumoLower.includes('tranquilo')) {
    return 'estavel';
  }
  
  // Se tem conteúdo mas não corresponde a nenhuma categoria específica,
  // assumir como estável (padrão positivo) em vez de sem-categoria
  return 'estavel';
};

export const clearStatusWhenNoMessages = async (groupId: number) => {
  const { supabase } = await import('@/integrations/supabase/client');
  
  try {
    const { error } = await supabase
      .from('Lista_de_Grupos')
      .update({ 
        status: null,
        resumo: 'Sem mensagens no grupo'
      })
      .eq('id', groupId);

    if (error) {
      console.error('Erro ao limpar status:', error);
      throw error;
    }
    
    console.log(`Status removido para o grupo ${groupId} (sem mensagens)`);
    return true;
  } catch (error) {
    console.error('Erro ao atualizar status do grupo:', error);
    return false;
  }
};