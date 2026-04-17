import React from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import { BottomNav } from './components/shared/BottomNav';
import { WaterfallOverlay } from './components/shared/WaterfallOverlay';
import HomeScreen from './screens/HomeScreen';
import VaultsScreen from './screens/VaultsScreen';
import CreditsScreen from './screens/CreditsScreen';
import InsightsScreen from './screens/InsightsScreen';
import ProfileScreen from './screens/ProfileScreen';
import OnboardingScreen from './screens/OnboardingScreen';
import OnboardingSplash from './screens/OnboardingSplash';
import { motion, AnimatePresence } from 'motion/react';
import { useApp } from './context/AppContext';

export default function App() {
  const location = useLocation();
  const { isSplashSeen, isSetupComplete } = useApp();

  if (!isSplashSeen) {
    return <OnboardingSplash />;
  }

  if (!isSetupComplete) {
    return <OnboardingScreen />;
  }

  return (
    <div className="min-h-screen bg-[#110C1E] text-white font-sans selection:bg-[#B685FF]/30">
      <AnimatePresence mode="wait">
        <motion.div
          key={location.pathname}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.3 }}
        >
          <Routes location={location}>
            <Route path="/" element={<HomeScreen />} />
            <Route path="/vaults" element={<VaultsScreen />} />
            <Route path="/credits" element={<CreditsScreen />} />
            <Route path="/insights" element={<InsightsScreen />} />
            <Route path="/profile" element={<ProfileScreen />} />
          </Routes>
        </motion.div>
      </AnimatePresence>
      <BottomNav />
      <WaterfallOverlay />
    </div>
  );
}
