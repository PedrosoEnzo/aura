import { Tabs } from "expo-router"
import { Ionicons } from "@expo/vector-icons"

export default function TabsLayout() {
    return(
        <Tabs screenOptions={{
            tabBarActiveTintColor: "#219f6f3",
            headerShown: true,
            headerStyle: {
                backgroundColor: "#2196f3"

            },
            headerTintColor: "#fff"
        }}>
            <Tabs.Screen name="home" options={{title:"Timeline", tabBarIcon: ({color, size}) => (
                <Ionicons name="home" size={size} color={color}/>
            )}}/>
            <Tabs.Screen name="profile" options={{title:"Perfil", tabBarIcon: ({color, size}) => (
                <Ionicons name="person" size={size} color={color}/>
            )}}/>
        </Tabs>
    )
}