import { Component, ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';

type Props = { name: string; children: ReactNode };
type State = { message: string | null };

export default class ErrorBoundary extends Component<Props, State> {
  state: State = { message: null };

  static getDerivedStateFromError(error: unknown): State {
    return {
      message: error instanceof Error ? error.message : String(error),
    };
  }

  render() {
    if (this.state.message !== null) {
      return (
        <View style={styles.box}>
          <Text style={styles.title}>{this.props.name} failed to load</Text>
          <Text style={styles.message}>{this.state.message}</Text>
        </View>
      );
    }
    return this.props.children;
  }
}

const styles = StyleSheet.create({
  box: {
    borderWidth: 2,
    borderColor: '#E5484D',
    borderRadius: 20,
    padding: 16,
    backgroundColor: '#2A1214',
  },
  title: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
  message: { color: '#FFB4B4', fontSize: 13, marginTop: 6 },
});
