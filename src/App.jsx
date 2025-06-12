// App.jsx
import React, { useState, useEffect } from 'react';
import { createBrowserRouter, RouterProvider, Outlet } from 'react-router-dom';
import { Toaster } from 'sonner';
import { useFocus } from './utils/useFocus'; // ← ADD THIS LINE
import { CartProvider } from './contexts/CartContext';
import { SearchProvider } from './contexts/SearchContext';
import { AuthProvider } from './contexts/AuthContext';
import { CategoryProvider } from './contexts/CategoryContext';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import RegionModal from './components/modals/RegionModal';
import HomePage from './pages/HomePage';
import ProductPage from './pages/ProductPage';
import CartPage from './pages/CartPage';
import CategoryPage from './pages/CategoryPage';
import SearchPage from './pages/SearchPage';
import AccountPage from './pages/AccountPage';
import './App.css';
import { medusaClient } from "./utils/client";
import CategoryList from './pages/CategoryList';

function App() {
  const Layout = () => {
    useFocus(); // ← ADD THIS LINE
    
    return (
      <div className="min-h-screen bg-white dark:bg-gray-900 flex flex-col transition-colors">
        <Header />
        <main className="flex-1">
          <Outlet />
        </main>
        <Footer />
        <Toaster position="bottom-right" />
        <RegionModal />
      </div>
    );
  };

  const router = createBrowserRouter([
    {
      path: "/",
      element: <Layout />,
      children: [
        {
          index: true,
          element: <HomePage />,
        },
        {
          path: ":handle?", // Optional handle parameter for home page with category
          element: <HomePage />,
        },
        {
          path: "products/:handle",
          element: <ProductPage />,
        },
        {
          path: "cart",
          element: <CartPage />,
        },
        {
          path: "categories",
          element: <CategoryList />,
        },
        {
          path: "search",
          element: <SearchPage />,
        },
        {
          path: "account",
          element: <AccountPage />,
        },
      ],
    },
  ]);

  return (
    <AuthProvider>
      <CategoryProvider>
      <CartProvider>
        <SearchProvider>
          <RouterProvider router={router} />
        </SearchProvider>
      </CartProvider>
      </CategoryProvider>
    </AuthProvider>
  );
}

export default App;