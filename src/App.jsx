import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import BottomNav from './components/BottomNav';
import Diagnosis from './pages/Diagnosis';
import Profile from './pages/Profile';
import HostPlan from './pages/HostPlan';
import ShoppingList from './pages/ShoppingList';
import './index.css';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/diagnosis" element={<Diagnosis />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/host" element={<HostPlan />} />
        <Route path="/list" element={<ShoppingList />} />
        <Route path="*" element={<Navigate to="/diagnosis" replace />} />
      </Routes>
      <BottomNav />
    </BrowserRouter>
  );
}

export default App;
