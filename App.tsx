import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import {
  SafeAreaProvider,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';

import { useTheme } from './src/theme/theme';
import TabBar, { TabKey } from './src/navigation/TabBar';
import HomeScreen from './src/screens/HomeScreen';
import LibraryScreen from './src/screens/LibraryScreen';
import CreatorScreen from './src/screens/CreatorScreen';
import SettingsScreen from './src/screens/SettingsScreen';

function Shell() {
  const t = useTheme();
  const insets = useSafeAreaInsets();
  const [tab, setTab] = useState<TabKey>('home');

  return (
    <View
      style={[
        styles.root,
        { backgroundColor: t.background, paddingTop: insets.top },
      ]}
    >
      <View style={styles.content}>
        {tab === 'home' && <HomeScreen />}
        {tab === 'library' && <LibraryScreen />}
        {tab === 'creator' && <CreatorScreen />}
        {tab === 'settings' && <SettingsScreen />}
      </View>
      <TabBar active={tab} onChange={setTab} />
      <StatusBar style={t.dark ? 'light' : 'dark'} />
    </View>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <Shell />
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  content: { flex: 1 },
});
