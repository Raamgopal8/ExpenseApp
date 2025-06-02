import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  MenuItem,
  Button,
  Box,
  IconButton,
  TablePagination,
  Chip,
} from '@mui/material';
import { Delete, Edit, Add } from '@mui/icons-material';
import { format } from 'date-fns';
import { useAppContext } from '../context/AppContext';

const ViewExpenses = () => {
  const { expenses, categories, deleteExpense, updateFilters } = useAppContext();
  const navigate = useNavigate();
  
  // Pagination state
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  
  // Filter state
  const [filters, setFilters] = useState({
    category: '',
    startDate: '',
    endDate: '',
  });

  // Handle pagination
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Handle filter changes
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    const newFilters = {
      ...filters,
      [name]: value,
    };
    setFilters(newFilters);
    updateFilters(newFilters);
  };

  // Reset filters
  const resetFilters = () => {
    const newFilters = {
      category: '',
      startDate: '',
      endDate: '',
    };
    setFilters(newFilters);
    updateFilters(newFilters);
  };

  // Get filtered expenses based on current filters
  const filteredExpenses = expenses.filter((expense) => {
    const matchesCategory = !filters.category || expense.category === filters.category;
    const matchesStartDate = !filters.startDate || new Date(expense.date) >= new Date(filters.startDate);
    const matchesEndDate = !filters.endDate || new Date(expense.date) <= new Date(filters.endDate);
    
    return matchesCategory && matchesStartDate && matchesEndDate;
  });

  // Calculate total amount for filtered expenses
  const totalAmount = filteredExpenses.reduce(
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

  // Handle delete expense
  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this expense?')) {
      deleteExpense(id);
    }
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4" component="h1">
          All Expenses
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


      {/* Filters */}
      <Paper sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          Filters
        </Typography>
        <Box display="flex" gap={2} flexWrap="wrap">
          <TextField
            select
            label="Category"
            name="category"
            value={filters.category}
            onChange={handleFilterChange}
            variant="outlined"
            size="small"
            sx={{ minWidth: 200 }}
          >
            <MenuItem value="">All Categories</MenuItem>
            {categories.map((category) => (
              <MenuItem key={category} value={category}>
                {category}
              </MenuItem>
            ))}
          </TextField>

          
          <TextField
            label="From Date"
            type="date"
            name="startDate"
            value={filters.startDate}
            onChange={handleFilterChange}
            InputLabelProps={{
              shrink: true,
            }}
            variant="outlined"
            size="small"
          />
          
          <TextField
            label="To Date"
            type="date"
            name="endDate"
            value={filters.endDate}
            onChange={handleFilterChange}
            InputLabelProps={{
              shrink: true,
            }}
            variant="outlined"
            size="small"
          />
          
          <Button
            variant="outlined"
            onClick={resetFilters}
            sx={{ ml: 'auto' }}
          >
            Reset Filters
          </Button>
        </Box>
        
        {filteredExpenses.length > 0 && (
          <Box mt={2}>
            <Chip
              label={`Total: ${formatCurrency(totalAmount)}`}
              color="primary"
              variant="outlined"
              sx={{ fontWeight: 'bold' }}
            />
            <Chip
              label={`${filteredExpenses.length} ${filteredExpenses.length === 1 ? 'expense' : 'expenses'}`}
              color="secondary"
              variant="outlined"
              sx={{ ml: 1 }}
            />
          </Box>
        )}
      </Paper>


      {/* Expenses Table */}
      <Paper sx={{ width: '100%', overflow: 'hidden' }}>
        <TableContainer sx={{ maxHeight: 600 }}>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell>Date</TableCell>
                <TableCell>Description</TableCell>
                <TableCell>Category</TableCell>
                <TableCell align="right">Amount</TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredExpenses.length > 0 ? (
                filteredExpenses
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((expense) => (
                    <TableRow key={expense.id} hover>
                      <TableCell>
                        {format(new Date(expense.date), 'MMM dd, yyyy')}
                      </TableCell>
                      <TableCell>{expense.description}</TableCell>
                      <TableCell>
                        <Chip 
                          label={expense.category} 
                          size="small"
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell align="right">
                        {formatCurrency(parseFloat(expense.amount))}
                      </TableCell>
                      <TableCell align="center">
                        <IconButton
                          size="small"
                          color="primary"
                          onClick={() => navigate(`/edit/${expense.id}`)}
                        >
                          <Edit fontSize="small" />
                        </IconButton>
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => handleDelete(expense.id)}
                        >
                          <Delete fontSize="small" />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                    <Typography color="textSecondary">
                      No expenses found. Add your first expense to get started!
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
        
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={filteredExpenses.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Paper>
    </Container>
  );
};

export default ViewExpenses;
