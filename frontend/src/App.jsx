import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import AppShell from './components/layout/AppShell';

// Pages
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import MindMap from './pages/MindMap';
import StudyPlan from './pages/StudyPlan';
import StudyEngine from './pages/StudyEngine';
import Topics from './pages/Topics';
import Materials from './pages/Materials';
import Projects from './pages/Projects';
import Timer from './pages/Timer';
import Notes from './pages/Notes';
import Flashcards from './pages/Flashcards';
import Quizzes from './pages/Quizzes';
import Analytics from './pages/Analytics';
import Ai from './pages/Ai';
import Settings from './pages/Settings';

import { TimerProvider } from './context/TimerContext';

export default function App() {
  return (
    <BrowserRouter>
      <TimerProvider>
        <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/os" element={<AppShell />}>
          <Route index element={<Navigate to="/os/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="mindmap" element={<MindMap />} />
          <Route path="study-plan" element={<StudyPlan />} />
          <Route path="study-engine" element={<StudyEngine />} />
          <Route path="topics" element={<Topics />} />
          <Route path="materials" element={<Materials />} />
          <Route path="projects" element={<Projects />} />
          <Route path="timer" element={<Timer />} />
          <Route path="notes" element={<Notes />} />
          <Route path="flashcards" element={<Flashcards />} />
          <Route path="quizzes" element={<Quizzes />} />
          <Route path="analytics" element={<Analytics />} />
          <Route path="ai" element={<Ai />} />
          <Route path="ai-assistant" element={<Ai />} />
          <Route path="settings" element={<Settings />} />
        </Route>
        </Routes>
      </TimerProvider>
    </BrowserRouter>
  );
}
