import { Component } from 'solid-js';
import { Router } from '@solidjs/router';
import { AuthProvider } from '@/contexts/AuthContext';
import Layout from '@/components/Layout';
import AppRoutes from '@/routes/AppRoutes';
import '@/styles/global.css';

const App: Component = () => {
  return (
    <AuthProvider>
      <Router>
        <Layout>
          <AppRoutes />
        </Layout>
      </Router>
    </AuthProvider>
  );
};

export default App;