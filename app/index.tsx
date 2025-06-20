import React, { useState, useRef } from "react";
import { View, Text, /*Button,*/ TextInput, StyleSheet, FlatList, TouchableOpacity } from "react-native";
import * as Haptics from "expo-haptics";
import { StatusBar } from "expo-status-bar";
import {Image} from "expo-image";
import { useWindowDimensions } from "react-native";

type Player = {
    id: number;
    name: string;
    score: number;
};

export default function App() {
    const { width, height } = useWindowDimensions();
    const isPortrait = height >= width;

    const [players, setPlayers] = useState<Player[]>([
        { id: 1, name: "Player 1", score: 0 },
        { id: 2, name: "Player 2", score: 0 },
    ]);
    const [resetConfirm, setResetConfirm] = useState(false);
    /*const resetTimeout = useRef<NodeJS.Timeout | null>(null);*/
    const resetTimeout = useRef<number | null>(null);

    const addPlayer = () => {
        if (players.length < 4) {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            setPlayers([
                ...players,
                { id: Date.now(), name: `Player ${players.length + 1}`, score: 0 },
            ]);
        }
    };

    const removePlayer = (id: number) => {
        if (players.length > 2) {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
            setPlayers(players.filter((p) => p.id !== id));
        }
    };

    const updateScore = (id: number, delta: number) => {
        //Haptics.selectionAsync();
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
        setPlayers(players.map((p) =>
            p.id === id ? { ...p, score: p.score + delta } : p
        ));
    };

    const updateName = (id: number, name: string) => {
        setPlayers(players.map((p) =>
            p.id === id ? { ...p, name } : p
        ));
    };

    const handleResetPress = () => {
        if (!resetConfirm) {
            Haptics.selectionAsync();
            setResetConfirm(true);
            resetTimeout.current = setTimeout(() => setResetConfirm(false), 4000);
        } else {
            if (resetTimeout.current) clearTimeout(resetTimeout.current);
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
            setPlayers(players.map((p) => ({ ...p, score: 0 })));
            setResetConfirm(false);
        }
    };

    const handleCancelReset = () => {
        if (resetTimeout.current) clearTimeout(resetTimeout.current);
        setResetConfirm(false);
    };

    return (
        <View style={[
            styles.container,
            isPortrait && { padding: 0/*, paddingTop: 40*/}
        ]}
        >
            <View style={styles.mainContent}>
            <StatusBar style="dark" />
            <Text style={styles.title}>Cruce score tracker</Text>
            <FlatList
                data={players}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }) => (
                    <View style={styles.playerRow}>
                        <TextInput
                            style={styles.nameInput}
                            value={item.name}
                            onChangeText={(text) => updateName(item.id, text)}
                        />
                        <TouchableOpacity onPress={() => updateScore(item.id, -1)} style={styles.button}>
                            {/*<Text style={styles.buttonText}>-</Text>*/}
                            <Image source={require("./assets/assets/images/remove.png")} style={{ width: 20, height: 20 }} />

                        </TouchableOpacity>
                        <Text style={styles.score}>{item.score}</Text>
                        <TouchableOpacity onPress={() => updateScore(item.id, 1)} style={styles.button}>
                            {/*<Text style={styles.buttonText}>+</Text>*/}
                            <Image source={require("./assets/assets/images/add.png")} style={{ width: 20, height: 20 }} />


                        </TouchableOpacity>
                        {players.length > 2 && (
                            <TouchableOpacity onPress={() => removePlayer(item.id)} style={styles.removeButton}>
                                {/*<Text style={styles.removeButtonText}>Rm</Text>*/}
                                <Image source={require("./assets/assets/images/close.png")} style={{ width: 20, height: 20 }} />
                            </TouchableOpacity>
                        )}
                    </View>
                )}
            />
            <View style={styles.bottomRow}>
                <TouchableOpacity
                    onPress={addPlayer}
                    style={[
                        styles.resetButton,
                        players.length >= 4 && { opacity: 0.5 }
                    ]}
                    disabled={players.length >= 4}
                >
                    <Text style={styles.resetButtonText}>+ Add Player</Text>
                </TouchableOpacity>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                    <TouchableOpacity
                        onPress={handleResetPress}
                        style={[
                            styles.resetButton,
                            resetConfirm && styles.resetButtonConfirm
                        ]}
                    >
                        <Text style={[
                            styles.resetButtonText,
                            resetConfirm && styles.resetButtonTextConfirm
                        ]}>
                            {resetConfirm ? "Are you sure?" : "Reset Scores"}
                        </Text>
                    </TouchableOpacity>
                    {resetConfirm && (
                        <TouchableOpacity onPress={handleCancelReset} style={styles.cancelButton}>
                            <Text style={styles.cancelButtonText}>Cancel</Text>
                        </TouchableOpacity>
                    )}
                </View>
            </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    title: {
        fontSize: 28,
        fontWeight: "bold",
        color: "#3730a3",
        textAlign: "center",
        marginBottom: 24,
    },
    mainContent: {
        borderRadius: 16,
        backgroundColor: "#F6F8FAFF",
        width: "100%",
        maxWidth: 500,
        alignSelf: "center",
        //padding: 40,
        padding: "2.5%",
        paddingTop: "8%",
        paddingBottom: "2.5%",
        height: "100%",
        minHeight: 320,
    },
    container: {
        flex: 1,
        backgroundColor: "#ffffff",//"#f6f8fa",
        padding: 20,
        paddingTop: 20,
    },
    playerRow: {
        flexDirection: "row",
        //flexGrow: 1,
        alignItems: "center",
        backgroundColor: "#fff",
        borderRadius: 16,
        padding: 16,
        marginVertical: 8,
        shadowColor: "#000",
        shadowOpacity: 0.08,
        shadowRadius: 6,
        shadowOffset: { width: 0, height: 2 },
        elevation: 2,
    },
    nameInput: {
        flex: 1,
        maxWidth: "60%",
        minWidth: "30%",
        flexShrink: 1,
        fontSize: 18,
        borderWidth: 0,
        backgroundColor: "#f0f4f8",
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 6,
        marginRight: 12,
        color: "#222",
    },
    button: {
        backgroundColor: "#e0e7ff",
        borderRadius: 10,
        paddingHorizontal: 16,
        paddingVertical: 8,
        marginHorizontal: 4,
        alignItems: "center",
        justifyContent: "center",
        aspectRatio: 1.05,
    },
    buttonText: {
        fontSize: 22,
        color: "#3730a3",
        fontWeight: "bold",
    },
    score: {
        fontSize: 22,
        width: 48,
        textAlign: "center",
        color: "#222",
        fontWeight: "600",
        paddingHorizontal: 5,
    },
    removeButton: {
        marginLeft: 8,
        backgroundColor: "#fee2e2",
        borderRadius: 8,
        padding: 4,
        alignItems: "center",
        justifyContent: "center",
    },
    removeButtonText: {
        fontSize: 10,
        color: "#b91c1c",
        fontWeight: "bold",
    },
    bottomRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginTop: 36,
        gap: 12,
        paddingBottom: 15,
    },
    resetButton: {
        backgroundColor: "#e0e7ff",
        borderRadius: 8,
        paddingHorizontal: 16,
        paddingVertical: 10,
        alignItems: "center",
        justifyContent: "center",
    },
    resetButtonConfirm: {
        backgroundColor: "#fee2e2",
    },
    resetButtonText: {
        fontSize: 16,
        color: "#3730a3",
        fontWeight: "bold",
    },
    resetButtonTextConfirm: {
        color: "#b91c1c",
    },
    cancelButton: {
        marginLeft: 8,
        backgroundColor: "#f0f4f8",
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 10,
    },
    cancelButtonText: {
        color: "#222",
        fontWeight: "bold",
        fontSize: 16,
    },
});
