import { Component } from 'solid-js';
import { Router } from '@solidjs/router';
import { AuthProvider } from '@/contexts/AuthContext';
import Layout from '@/components/Layout';
import AppRoutes from '@/routes/AppRoutes';
import { ToastContainer } from '@/components/Toast';
import { AuthRedirectHandler } from '@/components/AuthRedirectHandler';
import '@/styles/global.css';

const App: Component = () => {
  return (
    <AuthProvider>
      <Router root={props => (
        <>
          <AuthRedirectHandler />
          <Layout>
            {props.children}
          </Layout>
          <ToastContainer />
        </>
      )}>
        <AppRoutes />
      </Router>
    </AuthProvider>
  );
};

export default App;