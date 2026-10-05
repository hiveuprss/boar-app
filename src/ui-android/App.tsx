import { useEffect, useState } from "react";
import { StatusBar } from "expo-status-bar";
import { useFonts } from "expo-font";
import { StyleSheet, ActivityIndicator, View } from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import "../i18n";
// Registers preparedness and crypto before any screen reads the asset registry.
import "./registerPacks";
import { LanguageProvider } from "../i18n/LanguageContext";
import { ChatScreen } from "./ChatScreen";
import { ModelSetupScreen } from "./ModelSetupScreen";
import { ModelManager } from "../models/ModelManager";
import { ThemeProvider, useTheme } from "./theme";
import { initHaptics } from "../services/haptics";
import { FONT_FILES } from "./theme/fontFiles";

const modelManager = new ModelManager();

type Screen = "checking" | "required-setup" | "chat";

function AppContent() {
  const [screen, setScreen] = useState<Screen>("checking");
  const { colors } = useTheme();
  // Bundled files, so this is quick; on an error the text falls back to the system font.
  const [fontsLoaded, fontError] = useFonts(FONT_FILES);
  const fontsReady = fontsLoaded || fontError !== null;

  useEffect(() => {
    initHaptics();
  }, []);

  useEffect(() => {
    (async () => {
      const ready = await modelManager.requiredModelsPresent();
      setScreen(ready ? "chat" : "required-setup");
    })();
  }, []);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.bg.terminal }]} edges={["top", "bottom"]}>
      <StatusBar style="light" />
      {(screen === "checking" || !fontsReady) && (
        <View style={styles.centered}>
          <ActivityIndicator color={colors.emerald[400]} size="large" />
        </View>
      )}
      {fontsReady && screen === "required-setup" && (
        <ModelSetupScreen mode="required" onReady={() => setScreen("chat")} />
      )}
      {fontsReady && screen === "chat" && (
        <ChatScreen onRelaunchWizard={() => setScreen("required-setup")} />
      )}
    </SafeAreaView>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <LanguageProvider>
        <ThemeProvider>
          <AppContent />
        </ThemeProvider>
      </LanguageProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});
