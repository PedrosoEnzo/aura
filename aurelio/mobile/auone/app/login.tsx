import { Link } from "expo-router";
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function Login() {
    return (
        <ScrollView style={styles.container}>
            <View style={styles.header}>
                <Image source={require('../assets/images/auone.png')} style={{ width: 300, height: 200 }} />
            </View>
            <Text style={styles.textoPrincipal}>Login</Text>
            <View style={styles.corpo}>
                <View style={styles.containerInput}>
                    <Text style={styles.inputs}>Email</Text>
                    <Text style={styles.inputs}>Senha</Text>
                </View>
                <Text style={styles.esqueceuSenha}>Esqueceu sua senha? <Link href={'/conexaoBluetooth'}> <Text style={styles.esqueceuSenha2}>Criar Nova</Text></Link></Text>
                <View style={styles.containerBotao}>
                    <TouchableOpacity style={styles.botao}>
                        <Text style={styles.textoBotao}>Entrar</Text>
                    </TouchableOpacity>
                    <Text style={styles.botaoCadastro}>Não possui conta? <Link href={'/cadastro'}> <Text style={styles.botaoCadastro2}>Cadastre-se</Text></Link></Text>
                </View>
            </View>
        </ScrollView>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#fff"
    },
    header: {
        marginTop: 120,
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 30
    },
    corpo: {
        justifyContent: "center",
        alignItems: "center"
    },
    textoPrincipal: {
        fontSize: 24,
        fontWeight: "bold",
        color: "dark-green",
        marginLeft: 65,
        paddingBottom: 15
    },
    containerInput:{
        justifyContent: "center",
        alignItems: "center"
    },
    inputs: {
        borderWidth: 1,
        borderColor: "#042b00",
        marginBottom: 15,
        width: 300,
        height: 35,
        borderRadius: 20,
        paddingLeft: 20,
        paddingTop: 15,
        color: "#042b00",
        fontWeight: "medium"
    },
    esqueceuSenha: {
        fontSize: 10,
        color: "#042b00"
    },
    esqueceuSenha2: {
        fontWeight: "bold",
        color: "#042b00"
    },
    containerBotao: {
        justifyContent: "center",
        alignItems: "center"
    },
    botao: {
        justifyContent: "center",
        alignItems: "center",
        borderWidth: 1,
        borderColor: "#042b00",
        marginBottom: 15,
        width: 200,
        height: 35,
        borderRadius: 20,
    },
    textoBotao: {
        color: "#042b00",
        fontSize: 22,
        fontWeight: "500"
    },
    botaoCadastro: {
        fontSize: 10,
        color: "#042b00",
    },
    botaoCadastro2: {
        fontWeight: "bold",
        color: "#042b00"
    }
})