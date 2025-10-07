import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import UserProfile from './pages/UserProfile';

function App() {
  return (
    <Router>
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-6">
          <Routes>
            <Route path="/profile" element={<UserProfile />} />
            {/* مسیرهای دیگه مثل داشبورد، تنظیمات، و غیره */}
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
