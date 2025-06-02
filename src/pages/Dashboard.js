import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Grid, Paper, Typography, Box } from '@mui/material';
import { Add, List } from '@mui/icons-material';
import { useAppContext } from '../context/AppContext';

const Dashboard = () => {
  const { expenses } = useAppContext();
  const navigate = useNavigate();

  // Calculate total expenses
  const totalExpenses = expenses.reduce((sum, expense) => sum + parseFloat(expense.amount), 0);

  // Get recent expenses (last 5)
  const recentExpenses = [...expenses]
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 5);

  return (
    <Box>
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4" component="h1">
          Dashboard
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<Add />}
          onClick={() => navigate('/add')}
        >
          Add Expense
        </Button>
      </Box>


      <Grid container spacing={3}>
        {/* Total Expenses Card */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" color="textSecondary" gutterBottom>
              Total Expenses
            </Typography>
            <Typography variant="h4" color="primary">
              ${totalExpenses.toFixed(2)}
            </Typography>
          </Paper>
        </Grid>


        {/* Recent Transactions */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Box display="flex" justifyContent="space-between" mb={2}>
              <Typography variant="h6">Recent Transactions</Typography>
              <Button 
                color="primary" 
                endIcon={<List />}
                onClick={() => navigate('/expenses')}
              >
                View All
              </Button>
            </Box>
            {recentExpenses.length > 0 ? (
              <Box>
                {recentExpenses.map((expense) => (
                  <Box 
                    key={expense.id} 
                    sx={{ 
                      display: 'flex', 
                      justifyContent: 'space-between',
                      py: 1.5,
                      borderBottom: '1px solid rgba(0, 0, 0, 0.12)',
                      '&:last-child': {
                        borderBottom: 'none',
                      },
                    }}
                  >
                    <Box>
                      <Typography>{expense.description}</Typography>
                      <Typography variant="body2" color="textSecondary">
                        {new Date(expense.date).toLocaleDateString()}
                      </Typography>
                    </Box>
                    <Box textAlign="right">
                      <Typography variant="subtitle1">
                        ${parseFloat(expense.amount).toFixed(2)}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        {expense.category}
                      </Typography>
                    </Box>
                  </Box>
                ))}
              </Box>
            ) : (
              <Typography color="textSecondary" align="center" sx={{ py: 3 }}>
                No expenses recorded yet. Add your first expense to get started!
              </Typography>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;
