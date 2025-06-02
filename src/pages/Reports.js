import React, { useState, useMemo } from 'react';
import {
  Container,
  Typography,
  Paper,
  Grid,
  TextField,
  MenuItem,
  Box,
  ToggleButtonGroup,
  ToggleButton,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { format, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isWithinInterval } from 'date-fns';
import { useAppContext } from '../context/AppContext';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

const Reports = () => {
  const { expenses } = useAppContext();
  const [timeRange, setTimeRange] = useState('month');
  const [startDate, setStartDate] = useState(subMonths(new Date(), 1));
  const [endDate, setEndDate] = useState(new Date());
  const [chartType, setChartType] = useState('bar');

  // Filter expenses based on selected date range
  const filteredExpenses = useMemo(() => {
    if (!startDate || !endDate) return [];
    
    const start = startOfMonth(startDate);
    const end = endOfMonth(endDate);
    
    return expenses.filter(expense => {
      const expenseDate = new Date(expense.date);
      return isWithinInterval(expenseDate, { start, end });
    });
  }, [expenses, startDate, endDate]);

  // Prepare data for category chart
  const categoryData = useMemo(() => {
    const categoryMap = new Map();
    
    filteredExpenses.forEach(expense => {
      const amount = parseFloat(expense.amount);
      if (categoryMap.has(expense.category)) {
        categoryMap.set(expense.category, categoryMap.get(expense.category) + amount);
      } else {
        categoryMap.set(expense.category, amount);
      }
    });
    
    return Array.from(categoryMap.entries()).map(([name, value]) => ({
      name,
      value: parseFloat(value.toFixed(2)),
    }));
  }, [filteredExpenses]);

  // Prepare data for daily expenses chart
  const dailyData = useMemo(() => {
    if (!startDate || !endDate) return [];
    
    const days = eachDayOfInterval({
      start: startOfMonth(startDate),
      end: endOfMonth(endDate),
    });
    
    const dailyMap = new Map(
      days.map(day => [format(day, 'yyyy-MM-dd'), 0])
    );
    
    filteredExpenses.forEach(expense => {
      const date = format(new Date(expense.date), 'yyyy-MM-dd');
      if (dailyMap.has(date)) {
        dailyMap.set(date, dailyMap.get(date) + parseFloat(expense.amount));
      }
    });
    
    return Array.from(dailyMap.entries()).map(([date, amount]) => ({
      date: format(new Date(date), 'MMM dd'),
      amount: parseFloat(amount.toFixed(2)),
    }));
  }, [filteredExpenses, startDate, endDate]);

  // Handle time range change
  const handleTimeRangeChange = (event, newRange) => {
    if (newRange !== null) {
      setTimeRange(newRange);
      const today = new Date();
      
      switch (newRange) {
        case 'week':
          setStartDate(subMonths(today, 1));
          setEndDate(today);
          break;
        case 'month':
          setStartDate(subMonths(today, 3));
          setEndDate(today);
          break;
        case 'year':
          setStartDate(subMonths(today, 12));
          setEndDate(today);
          break;
        default:
          break;
      }
    }
  };

  // Calculate total expenses
  const totalExpenses = filteredExpenses.reduce(
    (sum, expense) => sum + parseFloat(expense.amount),
    0
  );

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4" component="h1">
          Expense Reports
        </Typography>
        
        <Box display="flex" gap={2} alignItems="center">
          <ToggleButtonGroup
            value={timeRange}
            exclusive
            onChange={handleTimeRangeChange}
            size="small"
            color="primary"
          >
            <ToggleButton value="week">Week</ToggleButton>
            <ToggleButton value="month">Month</ToggleButton>
            <ToggleButton value="year">Year</ToggleButton>
            <ToggleButton value="custom">Custom</ToggleButton>
          </ToggleButtonGroup>
          
          <ToggleButtonGroup
            value={chartType}
            exclusive
            onChange={(e, newType) => newType && setChartType(newType)}
            size="small"
            color="primary"
            sx={{ ml: 2 }}
          >
            <ToggleButton value="bar">Bar</ToggleButton>
            <ToggleButton value="pie">Pie</ToggleButton>
          </ToggleButtonGroup>
        </Box>
      </Box>


      {/* Date Range Selector */}
      <Paper sx={{ p: 3, mb: 4 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={5} md={3}>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DatePicker
                label="Start Date"
                value={startDate}
                onChange={(newValue) => {
                  setStartDate(newValue);
                  setTimeRange('custom');
                }}
                renderInput={(params) => <TextField {...params} fullWidth />}
              />
            </LocalizationProvider>
          </Grid>
          <Grid item xs={12} sm={5} md={3}>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DatePicker
                label="End Date"
                value={endDate}
                onChange={(newValue) => {
                  setEndDate(newValue);
                  setTimeRange('custom');
                }}
                renderInput={(params) => <TextField {...params} fullWidth />}
                minDate={startDate}
              />
            </LocalizationProvider>
          </Grid>
          <Grid item xs={12} sm={2}>
            <Typography variant="h6" align="center">
              Total: {formatCurrency(totalExpenses)}
            </Typography>
          </Grid>
        </Grid>
      </Paper>


      {/* Category Chart */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              Expenses by Category
            </Typography>
            <Box sx={{ height: 400, mt: 2 }}>
              <ResponsiveContainer width="100%" height="100%">
                {chartType === 'bar' ? (
                  <BarChart data={categoryData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip 
                      formatter={(value) => formatCurrency(value)}
                    />
                    <Legend />
                    <Bar dataKey="value" fill="#8884d8" name="Amount">
                      {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                ) : (
                  <PieChart>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={150}
                      fill="#8884d8"
                      dataKey="value"
                      nameKey="name"
                      label={({ name, percent }) => 
                        `${name}: ${(percent * 100).toFixed(0)}%`
                      }
                    >
                      {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(value) => formatCurrency(value)}
                    />
                    <Legend />
                  </PieChart>
                )}
              </ResponsiveContainer>
            </Box>
          </Paper>
        </Grid>
      </Grid>


      {/* Daily Expenses Chart */}
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Daily Expenses
            </Typography>
            <Box sx={{ height: 400, mt: 2 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dailyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip 
                    formatter={(value) => formatCurrency(value)}
                    labelFormatter={(label) => `Date: ${label}`}
                  />
                  <Legend />
                  <Bar dataKey="amount" name="Daily Amount" fill="#82ca9d">
                    {dailyData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[(index + 2) % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Reports;
