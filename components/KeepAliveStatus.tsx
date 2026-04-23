'use client';

import { useCallback, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';

export function KeepAliveStatus() {
  const [lastKeepAlive, setLastKeepAlive] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchStatus = useCallback(async () => {
    try {
      const res = await fetch('/api/keepalive-status');
      const data = await res.json();
      setLastKeepAlive(data.lastKeepAlive ?? null);
    } catch {
      setLastKeepAlive(null);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchStatus();
  }, [fetchStatus]);

  const handleAtualizar = async () => {
    setRefreshing(true);
    try {
      await fetch('/api/keepalive-status', { method: 'POST' });
    } catch {
      // ignora erro; fetchStatus atualiza o estado
    }
    await fetchStatus();
  };

  if (loading) return <p>Carregando...</p>;
  if (!lastKeepAlive) {
    return (
      <div className="rounded-xl bg-gray-100 dark:bg-gray-800 p-4 shadow w-full max-w-sm">
        <h3 className="text-lg font-semibold mb-2">Status do Supabase</h3>
        <p className="text-red-600 dark:text-red-400 mb-2">⚠️ Nenhuma atividade encontrada no Supabase ainda.</p>
        <Button variant="outline" size="sm" onClick={handleAtualizar} disabled={refreshing}>
          {refreshing ? 'Atualizando...' : 'Atualizar'}
        </Button>
      </div>
    );
  }

  const date = new Date(lastKeepAlive);
  const diffDays = Math.floor((Date.now() - date.getTime()) / (1000 * 60 * 60 * 24));

  return (
    <div className="rounded-xl bg-gray-100 dark:bg-gray-800 p-4 shadow w-full max-w-sm">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-lg font-semibold">Status do Supabase</h3>
        <Button variant="outline" size="sm" onClick={handleAtualizar} disabled={refreshing}>
          {refreshing ? 'Atualizando...' : 'Atualizar'}
        </Button>
      </div>
      <p>Último keep-alive: <strong>{date.toLocaleString()}</strong></p>
      <p>Tempo desde a última atividade: <strong>{diffDays} dia(s)</strong></p>
    </div>
  );
}
