import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { View, StyleSheet, ViewStyle } from "react-native"; // Não precisamos de Dimensions, pois left/right já resolvem
import { LinearGradient } from 'expo-linear-gradient';

interface TabBarBackgroundProps {
  style?: ViewStyle;
}

const TabBarBackground = ({ style }: TabBarBackgroundProps) => (
  <LinearGradient
    colors={['#0a5246ff', '#004d40']}
    start={{ x: 0, y: 0 }}
    end={{ x: 1, y: 0 }}
    style={[StyleSheet.absoluteFill, styles.gradientBackground, style]}
  />
);

interface TabIconProps {
  name: string;
  focused: boolean;
  color: string;
}

const TabIconWithIndicator = ({ name, focused, color }: TabIconProps) => {
  const ICON_SIZE = 26;
  const FOCUSED_SIZE = 30;

  return (
    <View style={styles.iconContainer}>
      <Ionicons
        name={`${name}-${focused ? 'sharp' : 'outline'}` as any}
        size={focused ? FOCUSED_SIZE : ICON_SIZE}
        color={color}
      />
      {focused && <View style={styles.activeIndicator} />}
    </View>
  );
};

export default function TabsLayout() {
  const ACTIVE_COLOR = "#ffffff";
  const INACTIVE_COLOR = "#c8d8cfff";

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarActiveTintColor: ACTIVE_COLOR,
        tabBarInactiveTintColor: INACTIVE_COLOR,
        tabBarStyle: {
          backgroundColor: "transparent",
          borderTopWidth: 0,
          height: 70,
          // REMOVIDO: width: 480, 
          shadowColor: "#000",
          shadowOffset: { width: 0, height: -3 },
          shadowOpacity: 0.15,
          shadowRadius: 12,
          borderRadius: 30,
          elevation: 6,
          position: 'absolute',
          left: 8,
          right: 8, // Isso garante que a barra se estenda de left a right
          bottom: 4,
        },
        tabBarItemStyle: {
          justifyContent: "center",
          alignItems: "center",
          paddingVertical: 10,
          // As abas internas se dividirão igualmente o espaço restante
        },
        tabBarBackground: () => <TabBarBackground />,
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          tabBarIcon: ({ color, focused }) => (
            <TabIconWithIndicator name="home" focused={focused} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="graficos"
        options={{
          tabBarIcon: ({ color, focused }) => (
            <TabIconWithIndicator name="stats-chart" focused={focused} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="chat"
        options={{
          tabBarIcon: ({ color, focused }) => (
            <TabIconWithIndicator name="chatbubble-ellipses" focused={focused} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="perfil"
        options={{
          tabBarIcon: ({ color, focused }) => (
            <TabIconWithIndicator name="person" focused={focused} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  gradientBackground: {
    borderRadius: 30,
    // Alterei para 'auto' ou mantive 10 para ajustar a margem do gradiente dentro do container
    marginHorizontal: 10,
    overflow: 'hidden',
  },
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
    minHeight: 40,
  },
  activeIndicator: {
    position: 'absolute',
    bottom: -6,
    width: 22,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: '#ffffff',
  },
});