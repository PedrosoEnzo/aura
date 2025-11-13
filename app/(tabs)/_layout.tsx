import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { View, StyleSheet, ViewStyle } from "react-native";
import { LinearGradient } from 'expo-linear-gradient';

// Tipagem para o componente de fundo da TabBar
interface TabBarBackgroundProps {
  style?: ViewStyle;
}

const TabBarBackground = ({ style }: TabBarBackgroundProps) => (
  <LinearGradient
    colors={['#3f7753ff', '#1a3b27ff']}
    start={{ x: 0, y: 0 }}
    end={{ x: 1, y: 0 }}
    style={[StyleSheet.absoluteFill, styles.gradientBackground, style]}
  />
);

interface TabIconProps {
  name: string;
  focused: boolean;
  color: string;
  size: number;
}

const TabIconWithIndicator = ({ name, focused, color, size }: TabIconProps) => {
  const ICON_SIZE = 26;
  const FOCUSED_SIZE = 30;

  return (
    <View style={styles.iconContainer}>
      <Ionicons
        name={`${name}-${focused ? 'sharp' : 'outline'}` as any}
        size={focused ? FOCUSED_SIZE : ICON_SIZE}
        color={color}
        style={focused ? { transform: [{ translateY: -4 }] } : undefined}
      />
      {focused && <View style={styles.activeIndicator} />}
    </View>
  );
};

export default function TabsLayout() {
  const ACTIVE_COLOR = "#ffffff";
  const INACTIVE_COLOR = "#c8d8cfff";
  const BACKGROUND_COLOR = "transparent";

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarActiveTintColor: ACTIVE_COLOR,
        tabBarInactiveTintColor: INACTIVE_COLOR,
        tabBarStyle: {
          backgroundColor: BACKGROUND_COLOR,
          borderTopWidth: 0,
          height: 74,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: -3 },
          shadowOpacity: 0.2,
          shadowRadius: 20,
          elevation: 8,
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: 0,
        },
        tabBarItemStyle: {
          justifyContent: "center",
          alignItems: "center",
          marginTop: 20,
          paddingBottom: 5,
        },
        tabBarBackground: () => <TabBarBackground />,
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          tabBarIcon: ({ color, size, focused }) => (
            <TabIconWithIndicator
              name="home"
              focused={focused}
              color={color}
              size={size}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="graficos"
        options={{
          tabBarIcon: ({ color, size, focused }) => (
            <TabIconWithIndicator
              name="stats-chart"
              focused={focused}
              color={color}
              size={size}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="chat"
        options={{
          tabBarIcon: ({ color, size, focused }) => (
            <TabIconWithIndicator
              name="chatbubble-ellipses"
              focused={focused}
              color={color}
              size={size}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="perfil"
        options={{
          tabBarIcon: ({ color, size, focused }) => (
            <TabIconWithIndicator
              name="person"
              focused={focused}
              color={color}
              size={size}
            />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  gradientBackground: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    overflow: 'hidden',
  },
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 40,
  },
  activeIndicator: {
    position: 'absolute',
    bottom: -5,
    width: 20,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: '#ffffff',
  },
});
