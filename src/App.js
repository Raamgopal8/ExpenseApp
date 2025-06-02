import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { AppProvider } from './context/AppContext';
import Layout from './components/common/Layout';
import Dashboard from './pages/Dashboard';
import AddExpense from './pages/AddExpense';
import ViewExpenses from './pages/ViewExpenses';
import Reports from './pages/Reports';
import theme from './theme';

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AppProvider>
        <Layout>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/add" element={<AddExpense />} />
            <Route path="/expenses" element={<ViewExpenses />} />
            <Route path="/reports" element={<Reports />} />
          </Routes>
        </Layout>
      </AppProvider>
    </ThemeProvider>
  );
}

export default App;
