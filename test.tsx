import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { supabase } from '@/lib/supabase';

type Status = 'loading' | 'ok' | 'error';

export default function TestScreen() {
  const [status, setStatus]   = useState<Status>('loading');
  const [detail, setDetail]   = useState('');
  const [cardCount, setCardCount] = useState<number | null>(null);

  useEffect(() => {
    async function run() {
      // 1. Check env vars are set
      const url  = process.env.EXPO_PUBLIC_SUPABASE_URL;
      const anon = process.env.EXPO_PUBLIC_SUPABASE_ANON;

      if (!url || url.includes('YOUR_PROJECT')) {
        setStatus('error');
        setDetail('EXPO_PUBLIC_SUPABASE_URL is missing or still a placeholder in .env.local');
        return;
      }
      if (!anon || anon.includes('your-anon')) {
        setStatus('error');
        setDetail('EXPO_PUBLIC_SUPABASE_ANON is missing or still a placeholder in .env.local');
        return;
      }

      // 2. Try a real query — count HSK 1 cards
      const { count, error } = await supabase
        .from('cards')
        .select('*', { count: 'exact', head: true })
        .eq('hsk_level', 1);

      if (error) {
        setStatus('error');
        setDetail(error.message);
      } else {
        setStatus('ok');
        setCardCount(count);
        setDetail(`Connected to: ${url}`);
      }
    }

    run();
  }, []);

  return (
    <View style={s.root}>
      {status === 'loading' && (
        <>
          <ActivityIndicator color="#C0392B" size="large" />
          <Text style={s.label}>Connecting to Supabase…</Text>
        </>
      )}

      {status === 'ok' && (
        <>
          <Text style={s.icon}>✓</Text>
          <Text style={s.title}>Connection successful</Text>
          {cardCount !== null && (
            <Text style={s.stat}>{cardCount} HSK 1 cards found in database</Text>
          )}
          <Text style={s.detail}>{detail}</Text>
        </>
      )}

      {status === 'error' && (
        <>
          <Text style={[s.icon, s.iconError]}>✗</Text>
          <Text style={[s.title, s.titleError]}>Connection failed</Text>
          <Text style={s.detail}>{detail}</Text>
          <Text style={s.hint}>
            Check your .env.local file and restart the dev server with{'\n'}
            <Text style={s.code}>npx expo start --clear</Text>
          </Text>
        </>
      )}
    </View>
  );
}

const s = StyleSheet.create({
  root:       { flex:1, backgroundColor:'#131109', alignItems:'center', justifyContent:'center', padding:32 },
  icon:       { fontSize:48, color:'#4A9E6B', marginBottom:16 },
  iconError:  { color:'#E05252' },
  title:      { fontSize:22, color:'#F0EBE0', fontWeight:'500', marginBottom:12, textAlign:'center' },
  titleError: { color:'#E05252' },
  stat:       { fontSize:16, color:'#A09880', marginBottom:12 },
  detail:     { fontSize:11, color:'#5C5646', textAlign:'center', lineHeight:18, marginBottom:20 },
  label:      { fontSize:14, color:'#5C5646', marginTop:16 },
  hint:       { fontSize:12, color:'#5C5646', textAlign:'center', lineHeight:20 },
  code:       { fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace', color:'#A09880' },
});
