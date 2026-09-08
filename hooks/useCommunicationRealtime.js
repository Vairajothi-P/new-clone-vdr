import { useEffect } from 'react';
import { createBrowserClient } from '@supabase/ssr';

export function useCommunicationRealtime({ channelId, onNewMessage, onPresenceUpdate }) {
  useEffect(() => {
    // Note: Requires NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseKey) {
      console.warn('Supabase URL or Key not found. Realtime disabled.');
      return;
    }

    const supabase = createBrowserClient(supabaseUrl, supabaseKey);

    // 1. Subscribe to Messages Table for the specific channel
    const messageChannel = supabase.channel(`messages:channelId=eq.${channelId}`)
      .on('postgres_changes', { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'messages',
          filter: `channel_id=eq.${channelId}`
        }, (payload) => {
          if (onNewMessage) onNewMessage(payload.new);
      })
      .subscribe();

    // 2. Presence tracking
    const presenceChannel = supabase.channel(`presence:channel_${channelId}`)
      .on('presence', { event: 'sync' }, () => {
        const state = presenceChannel.presenceState();
        if (onPresenceUpdate) onPresenceUpdate(state);
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await presenceChannel.track({ online_at: new Date().toISOString() });
        }
      });

    return () => {
      supabase.removeChannel(messageChannel);
      supabase.removeChannel(presenceChannel);
    };
  }, [channelId, onNewMessage, onPresenceUpdate]);
}
