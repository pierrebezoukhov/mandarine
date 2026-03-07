import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useAuth } from '@/context/AuthContext';

export default function HomeScreen() {
  const { user, signOut } = useAuth();

  return (
    <View style={s.root}>
      <Text style={s.title}>漢字 Flash</Text>
      <Text style={s.sub}>Signed in as {user?.email}</Text>
      <TouchableOpacity style={s.btn} onPress={signOut}>
        <Text style={s.btnText}>Sign out</Text>
      </TouchableOpacity>
    </View>
  );
}

const s = StyleSheet.create({
  root:    { flex: 1, backgroundColor: '#131109', alignItems: 'center', justifyContent: 'center', gap: 16 },
  title:   { fontSize: 32, color: '#F0EBE0', letterSpacing: 2 },
  sub:     { fontSize: 13, color: '#5C5646' },
  btn:     { marginTop: 8, borderWidth: 1, borderColor: 'rgba(255,248,220,0.08)', borderRadius: 100, paddingHorizontal: 24, paddingVertical: 12 },
  btnText: { color: '#A09880', fontSize: 13 },
});
