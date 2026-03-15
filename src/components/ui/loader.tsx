import { ActivityIndicator, StyleSheet, View } from 'react-native';

function Loader({ size, color }: { size: "large" | "small", color: string }) {
    return (
        <View style={styles.loadingOverlay}>
            <ActivityIndicator size={size} color={color} />
        </View>
    )
}

const styles = StyleSheet.create({
    loadingOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 999,
    },
})

export default Loader;