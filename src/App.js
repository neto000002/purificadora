import React from "react";
import { ThemeProvider } from "@mui/material/styles";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import theme from "./theme";
import Login from "./components/Login";
import RegisterDeliveryMan from "./components/RegisterDeliveryMan";
import SalesAccounts from "./components/SalesAccounts";
import Fiados from "./components/Fiados";
import Expenses from "./components/Expenses";
import Dashboard from "./components/DashboardPanel";
import DeliveryPanel from "./components/DeliveryPanel";
import DeliverySales from "./components/DeliverySales";
import SalesList from './components/SalesList';  // Asegúrate de importar el componente SalesList
import DeliveryFiados from "./components/DeliveryFiados";
import DeliveryExpenses from "./components/DeliveryExpenses";
import RegisterClient from "./components/RegisterClient";
import DeliveryReports from "./components/DeliveryReports";
import DeliveryInventory from "./components/DeliveryInventory";
import ProtectedRoute from "./components/ProtectedRoute"; // Importar el componente de protección de rutas
import InventoryPage from "./components/InventoryPage"; // 👈 importar correctamente


function App() {
  return (
    <ThemeProvider theme={theme}>
      <Router>
        <div style={{ textAlign: "center", padding: "20px" }}>
          <Routes>
            <Route path="/" element={<Login />} />

            {/* Rutas protegidas para el admin */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute roleRequired="admin">
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/sales"
              element={
                <ProtectedRoute roleRequired="admin">
                  <SalesAccounts />
                </ProtectedRoute>
              }
            />
            <Route
              path="/inventory"
              element={
                <ProtectedRoute roleRequired="admin">
                  <InventoryPage/>
                </ProtectedRoute>
              }
            />
            <Route
              path="/fiados"
              element={
                <ProtectedRoute roleRequired="admin">
                  <Fiados />
                </ProtectedRoute>
              }
            />
            <Route
              path="/expenses"
              element={
                <ProtectedRoute roleRequired="admin">
                  <Expenses />
                </ProtectedRoute>
              }
            />

            {/* Rutas protegidas para los repartidores */}
            <Route
              path="/delivery-panel"
              element={
                <ProtectedRoute roleRequired="repartidor">
                  <DeliveryPanel />
                </ProtectedRoute>
              }
            />
            <Route
              path="/delivery-sales"
              element={
                <ProtectedRoute roleRequired="repartidor">
                  <DeliverySales />
                </ProtectedRoute>
              }
            />
            <Route
              path="/sales-list"  
              element={
                <ProtectedRoute roleRequired="repartidor">
                  <SalesList />
                </ProtectedRoute>
              }
            />
            <Route
              path="/delivery-fiados"
              element={
                <ProtectedRoute roleRequired="repartidor">
                  <DeliveryFiados />
                </ProtectedRoute>
              }
            />
            <Route
              path="/delivery-expenses"
              element={
                <ProtectedRoute roleRequired="repartidor">
                  <DeliveryExpenses />
                </ProtectedRoute>
              }
            />
    
            <Route
              path="/register-client"
              element={
                <ProtectedRoute roleRequired="repartidor">
                  <RegisterClient />
                </ProtectedRoute>
              }
            />
            <Route
              path="/delivery-reports"
              element={
                <ProtectedRoute roleRequired="repartidor">
                  <DeliveryReports />
                </ProtectedRoute>
              }
            />
            <Route
              path="/delivery-inventory"
              element={
                <ProtectedRoute roleRequired="repartidor">
                  <DeliveryInventory />
                </ProtectedRoute>
              }
            />

            {/* Rutas públicas */}
            <Route path="/register-deliveryman" element={<RegisterDeliveryMan />} />
          </Routes>
        </div>
      </Router>
    </ThemeProvider>
  );
}

export default App;
