import { Component, ReactNode } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MONO, FS, FW, LS } from '@/theme/tokens';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error) {
    console.error('[ErrorBoundary]', error);
  }

  render() {
    if (this.state.hasError) {
      return (
        <View style={s.root}>
          <Text style={s.icon}>!</Text>
          <Text style={s.title}>Something went wrong</Text>
          <Text style={s.subtitle}>Please restart the app</Text>
        </View>
      );
    }
    return this.props.children;
  }
}

const s = StyleSheet.create({
  root: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0c0b09',
    padding: 32,
  },
  icon: {
    fontFamily: MONO,
    fontSize: 32,
    fontWeight: FW.medium,
    color: '#c8382a',
    marginBottom: 16,
  },
  title: {
    fontFamily: MONO,
    fontSize: FS.definition,
    fontWeight: FW.medium,
    color: '#e8e0d0',
    letterSpacing: LS.wide * FS.definition,
    marginBottom: 8,
  },
  subtitle: {
    fontFamily: MONO,
    fontSize: FS.body,
    color: '#8a8070',
    letterSpacing: LS.wide * FS.body,
  },
});
