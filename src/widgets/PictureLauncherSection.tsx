import { useState } from 'react';
import {
  Image,
  LayoutChangeEvent,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { radius, spacing, useTheme } from '../theme/theme';
import { AppInfo, iconUri, launchApp } from '../native/InstalledApps';
import { deleteStoredImage, pickAndStoreImage } from '../native/pickImage';
import { usePersistedState } from '../storage/storage';
import AppPickerModal from '../components/AppPickerModal';
import { SavedApp } from './PersonalCardWidget';

type Tile = { id: string; imageUri: string; app: SavedApp | null };

const MAX_TILES = 4;
const GAP = 12;

export default function PictureLauncherSection() {
  const t = useTheme();
  const [tiles, setTiles, loaded] = usePersistedState<Tile[]>(
    'pictureLauncher.v1',
    []
  );
  const [editing, setEditing] = useState(false);
  const [pickingId, setPickingId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [width, setWidth] = useState(300);

  const tileSize = (width - GAP) / 2;

  const onLayout = (e: LayoutChangeEvent) => {
    setWidth(e.nativeEvent.layout.width);
  };

  const addTile = async () => {
    if (busy) return;
    setBusy(true);
    setMessage('');
    const id = `tile-${Date.now()}`;
    const uri = await pickAndStoreImage(id);
    if (uri) {
      setTiles([...tiles, { id, imageUri: uri, app: null }]);
      setPickingId(id);
    } else {
      setMessage('No photo was added.');
    }
    setBusy(false);
  };

  const changeImage = async (tile: Tile) => {
    if (busy) return;
    setBusy(true);
    setMessage('');
    const uri = await pickAndStoreImage(tile.id);
    if (uri) {
      await deleteStoredImage(tile.imageUri);
      setTiles(
        tiles.map((x) => (x.id === tile.id ? { ...x, imageUri: uri } : x))
      );
    } else {
      setMessage('The photo was not changed.');
    }
    setBusy(false);
  };

  const setApp = (id: string, app: AppInfo | null) => {
    setTiles(
      tiles.map((x) =>
        x.id === id
          ? {
              ...x,
              app: app
                ? {
                    packageName: app.packageName,
                    label: app.label,
                    icon: app.icon,
                  }
                : null,
            }
          : x
      )
    );
    setPickingId(null);
    setMessage('');
  };

  const removeTile = async (tile: Tile) => {
    await deleteStoredImage(tile.imageUri);
    setTiles(tiles.filter((x) => x.id !== tile.id));
  };

  const pressTile = async (tile: Tile) => {
    if (!tile.app) {
      setPickingId(tile.id);
      return;
    }
    const ok = await launchApp(tile.app.packageName);
    setMessage(
      ok ? '' : `${tile.app.label} is not available. Tap Edit, then App.`
    );
  };

  const pickingTile = tiles.find((x) => x.id === pickingId) ?? null;

  return (
    <View
      style={[
        styles.section,
        { backgroundColor: t.card, borderColor: t.cardBorder },
      ]}
    >
      <View style={styles.header}>
        <View style={styles.headerText}>
          <Text style={[styles.title, { color: t.text }]}>Picture Launcher</Text>
          <Text style={[styles.sub, { color: t.textMuted }]}>
            Tap a photo to open its app.
          </Text>
        </View>
        <Pressable
          onPress={() => setEditing(!editing)}
          style={[styles.editButton, { borderColor: t.cardBorder }]}
        >
          <Text style={[styles.editText, { color: t.text }]}>
            {editing ? 'Done' : 'Edit'}
          </Text>
        </Pressable>
      </View>

      <View onLayout={onLayout} style={styles.grid}>
        {loaded &&
          tiles.map((tile) => (
            <View key={tile.id} style={{ width: tileSize }}>
              <Pressable
                onPress={() => pressTile(tile)}
                style={[
                  styles.tile,
                  { width: tileSize, height: tileSize },
                ]}
              >
                <Image
                  source={{ uri: tile.imageUri }}
                  style={{ width: tileSize, height: tileSize }}
                  resizeMode="cover"
                />
                {tile.app ? (
                  <View style={styles.badge}>
                    <Image
                      source={{ uri: iconUri(tile.app) }}
                      style={styles.badgeIcon}
                    />
                  </View>
                ) : (
                  <View style={styles.noApp}>
                    <Text style={styles.noAppText}>Tap to link an app</Text>
                  </View>
                )}
              </Pressable>
              {editing && (
                <View style={styles.controls}>
                  <Pressable
                    onPress={() => changeImage(tile)}
                    style={[styles.control, { borderColor: t.cardBorder }]}
                  >
                    <Text style={[styles.controlText, { color: t.text }]}>
                      Image
                    </Text>
                  </Pressable>
                  <Pressable
                    onPress={() => setPickingId(tile.id)}
                    style={[styles.control, { borderColor: t.cardBorder }]}
                  >
                    <Text style={[styles.controlText, { color: t.text }]}>
                      App
                    </Text>
                  </Pressable>
                  <Pressable
                    onPress={() => removeTile(tile)}
                    style={[styles.control, { borderColor: t.cardBorder }]}
                  >
                    <Text style={[styles.controlText, { color: t.text }]}>
                      Remove
                    </Text>
                  </Pressable>
                </View>
              )}
            </View>
          ))}

        {loaded && tiles.length < MAX_TILES && (
          <Pressable
            onPress={addTile}
            style={[
              styles.tile,
              styles.addTile,
              {
                width: tileSize,
                height: tileSize,
                borderColor: t.cardBorder,
              },
            ]}
          >
            <Text style={[styles.plus, { color: t.textMuted }]}>+</Text>
            <Text style={[styles.addText, { color: t.textMuted }]}>
              {busy ? 'Opening...' : 'Add photo tile'}
            </Text>
          </Pressable>
        )}
      </View>

      {message !== '' && (
        <Text style={[styles.message, { color: t.text }]}>{message}</Text>
      )}

      <AppPickerModal
        visible={pickingId !== null}
        title="Link an app"
        onClose={() => setPickingId(null)}
        onSelect={(app) => {
          if (pickingId !== null) setApp(pickingId, app);
        }}
        onRemove={
          pickingTile && pickingTile.app
            ? () => setApp(pickingTile.id, null)
            : undefined
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    borderRadius: radius.card,
    borderWidth: 1,
    padding: spacing.lg,
  },
  header: { flexDirection: 'row', alignItems: 'center' },
  headerText: { flex: 1 },
  title: { fontSize: 18, fontWeight: '600' },
  sub: { fontSize: 14, marginTop: spacing.xs },
  editButton: {
    borderWidth: 1,
    borderRadius: radius.pill,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  editText: { fontSize: 14, fontWeight: '600' },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: GAP,
    marginTop: spacing.md,
  },
  tile: {
    borderRadius: 24,
    overflow: 'hidden',
    backgroundColor: '#14161B',
  },
  badge: {
    position: 'absolute',
    right: 8,
    bottom: 8,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.65)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeIcon: { width: 28, height: 28, borderRadius: 7 },
  noApp: {
    position: 'absolute',
    left: 8,
    right: 8,
    bottom: 8,
    backgroundColor: 'rgba(0,0,0,0.65)',
    borderRadius: 12,
    paddingVertical: 6,
    alignItems: 'center',
  },
  noAppText: { color: '#FFFFFF', fontSize: 12, fontWeight: '600' },
  addTile: {
    borderWidth: 1,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
  },
  plus: { fontSize: 36, fontWeight: '300' },
  addText: { fontSize: 13, marginTop: 4 },
  controls: { flexDirection: 'row', gap: 6, marginTop: 8 },
  control: {
    flex: 1,
    borderWidth: 1,
    borderRadius: radius.pill,
    paddingVertical: 6,
    alignItems: 'center',
  },
  controlText: { fontSize: 12, fontWeight: '600' },
  message: { fontSize: 14, fontWeight: '600', marginTop: spacing.md },
});
