import { BrowserRouter, Routes, Route, Outlet } from 'react-router-dom';
import Home from './pages/Home';
import LoginPage from './pages/LoginPage';
import SignUpPage from './pages/SignUpPage';
import EditorPage from './pages/EditorPage';
import NotFound from './pages/NotFound';
import Header from './components/Header';
import Footer from './components/Footer';
import { ThemeProvider } from './contexts/ThemeContext';

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
  return (
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
  );
}