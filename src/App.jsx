import { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Outlet } from 'react-router-dom';
import Lenis from 'lenis';
import Home from './pages/Home';
import LoginPage from './pages/LoginPage';
import SignUpPage from './pages/SignUpPage';
import EditorPage from './pages/EditorPage';
import NotFound from './pages/NotFound';
import Header from './components/Header';
import Footer from './components/Footer';
import { ThemeProvider } from './contexts/ThemeContext';
import { LenisContext } from './contexts/LenisContext';

// Layout with Header and Footer
function AppLayout() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow">
        <Outlet /> {/* Child route component will be rendered here */}
      </main>
      <Footer />
    </div>
  );
}

// Layout for full-screen pages like Login/SignUp
function FullScreenLayout() {
    return <Outlet />;
}

export default function App() {
  const [lenis, setLenis] = useState(null);

  useEffect(() => {
    const lenisInstance = new Lenis();

    function raf(time) {
      lenisInstance.raf(time);
      requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);
    setLenis(lenisInstance);

    return () => {
      lenisInstance.destroy();
    };
  }, []);

  return (
    <LenisContext.Provider value={lenis}>
      <ThemeProvider>
        <BrowserRouter>
          <Routes>
            {/* Routes with the main layout */}
            <Route element={<AppLayout />}>
              <Route path="/" element={<Home />} />
            </Route>

            {/* Routes without the main layout */}
            <Route element={<FullScreenLayout />}>
                <Route path="/login" element={<LoginPage />} />
                <Route path="/signup" element={<SignUpPage />} />
                <Route path="/editor" element={<EditorPage />} />
            </Route>

            {/* Catch-all Not Found Route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </ThemeProvider>
    </LenisContext.Provider>
  );
}