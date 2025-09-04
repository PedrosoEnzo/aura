import { Link } from "expo-router";
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function Home() {
    return (
        <ScrollView style={styles.container}>
            <View style={styles.tudo}>
                <View style={styles.containerPrincipal}>
                    <Image source={require('../assets/images/auone.png')} style={{ width: 300, height: 200 }} />
                    <Text style={styles.textoPrincipal}>Sua estação ambiental inteligente</Text>
                </View>
                <Link href={'/login'}>
                    <TouchableOpacity style={styles.botao}>
                        <Text style={styles.textoBotao}>Começar</Text>
                    </TouchableOpacity>
                </Link>
            </View>
        </ScrollView>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#fff"
    },
    tudo: {
        justifyContent: "center",
        alignItems: "center"
    },
    containerPrincipal: {
        justifyContent: "center",
        alignItems: "center",
        paddingTop: 280,
        paddingBottom: 25
    },
    textoPrincipal: {
        fontSize: 22,
        color: "#042b00",
        fontWeight: "normal"
    },
    botao: {
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#042b00",
        borderRadius: 20,
        width: 130,
        height: 40
    },
    textoBotao: {
        justifyContent: "center",
        alignItems: "center",
        fontSize: 20,
        fontWeight: "bold",
        color: "#fff"
    }
})