import React, { createContext, useContext, useReducer } from 'react';

const AppContext = createContext();

const initialState = {
  expenses: [],
  categories: ['Food', 'Transportation', 'Housing', 'Entertainment', 'Utilities', 'Others'],
  filters: {
    category: '',
    startDate: null,
    endDate: null,
  },
};

const reducer = (state, action) => {
  switch (action.type) {
    case 'ADD_EXPENSE':
      return {
        ...state,
        expenses: [...state.expenses, {
          ...action.payload,
          id: Date.now().toString(),
          date: new Date().toISOString(),
        }],
      };
    case 'DELETE_EXPENSE':
      return {
        ...state,
        expenses: state.expenses.filter(expense => expense.id !== action.payload),
      };
    case 'UPDATE_FILTERS':
      return {
        ...state,
        filters: {
          ...state.filters,
          ...action.payload,
        },
      };
    default:
      return state;
  }
};

export const AppProvider = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, initialState);

  const addExpense = (expense) => {
    dispatch({ type: 'ADD_EXPENSE', payload: expense });
  };

  const deleteExpense = (id) => {
    dispatch({ type: 'DELETE_EXPENSE', payload: id });
  };

  const updateFilters = (filters) => {
    dispatch({ type: 'UPDATE_FILTERS', payload: filters });
  };

  const getFilteredExpenses = () => {
    return state.expenses.filter(expense => {
      const matchesCategory = !state.filters.category || 
        expense.category === state.filters.category;
      return matchesCategory;
    });
  };

  return (
    <AppContext.Provider
      value={{
        ...state,
        addExpense,
        deleteExpense,
        updateFilters,
        getFilteredExpenses,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  return useContext(AppContext);
};
