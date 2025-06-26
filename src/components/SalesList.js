import React, { useState, useEffect, useRef } from 'react';
import { Button, IconButton, Table, TableHead, TableBody, TableRow, TableCell, TableContainer, Paper, Snackbar, Alert, MenuItem, Select, Typography } from '@mui/material';
import { Person, ArrowForward, Cancel } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";



const SalesList = ({ modoAdmin = false }) => {
  const navigate = useNavigate();
  const [sales, setSales] = useState([]);
  const [deliverymen, setDeliverymen] = useState([]);
  const [editingSale, setEditingSale] = useState(null);
  const [updatedSales, setUpdatedSales] = useState([]);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [showTotal, setShowTotal] = useState(false);
  const [soldSales, setSoldSales] = useState(new Set());  // Estado para marcar las ventas como vendidas
  const [fiadosSales, setFiadosSales] = useState(new Set());  // Estado para marcar las ventas como fiadas
  const [canGenerateReport, setCanGenerateReport] = useState(false);
  const [expenses, setExpenses] = useState([]);


  const tableRef = useRef(null);

  useEffect(() => {
    const savedUpdatedSales = JSON.parse(localStorage.getItem('updatedSales')) || [];
    const savedSoldSales = JSON.parse(localStorage.getItem('soldSales')) || [];
    const savedFiadosSales = JSON.parse(localStorage.getItem('fiadosSales')) || [];

    const fetchSales = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch('http://localhost:5000/api/sales/list', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error('Error al obtener las ventas');
        }

        const data = await response.json();
        setSales(data);
      } catch (error) {
        setSnackbarMessage(error.message);
        setSnackbarSeverity('error');
        setOpenSnackbar(true);
      }
    };

    const fetchDeliverymen = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/deliverymen/list');
        const data = await response.json();
        setDeliverymen(data);
      } catch (error) {
        console.error('Error fetching deliverymen:', error);
      }
    };

    fetchSales();
    fetchDeliverymen();
    setUpdatedSales(savedUpdatedSales);
    setSoldSales(new Set(savedSoldSales));
    setFiadosSales(new Set(savedFiadosSales));
  }, []);

  useEffect(() => {
    const fetchExpenses = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/expenses/gastos');
        const data = await response.json();
        setExpenses(data);
      } catch (error) {
        console.error('Error al obtener los gastos:', error);
      }
    };

    fetchExpenses();
  }, []);

   // Verificación del horario permitido para generar reporte
   useEffect(() => {
    const checkReportTime = () => {
      const now = new Date();
      const day = now.getDay(); // 0: domingo, 1: lunes, ..., 6: sábado
      const hours = now.getHours();
      const minutes = now.getMinutes();
      const totalMinutes = hours * 60 + minutes;

      let allowed = false;
      if ((day >= 1 && day <= 4 && totalMinutes >= 990) ||    // Lunes a jueves después de 4:30 PM (990 min)
          (day === 5 && totalMinutes >= 930) ||               // Viernes después de 3:30 PM (930 min)
          (day === 6 && totalMinutes >= 750)) {               // Sábado después de 12:30 PM (750 min)
        allowed = true;
      }

      setCanGenerateReport(allowed);
    };

    checkReportTime();

    const interval = setInterval(checkReportTime, 60000); // verificar cada minuto
    return () => clearInterval(interval);
  }, []);

  const handleUpdateDeliveryman = async (saleId, newDeliveryman) => {
    try {
      const response = await fetch(`http://localhost:5000/api/sales/update-deliveryman/${saleId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ deliveryman: newDeliveryman }),
      });

      if (!response.ok) {
        throw new Error('Error al actualizar el repartidor');
      }

      setSales(prevSales => prevSales.map(sale => 
        sale.id === saleId ? { ...sale, deliveryman: newDeliveryman } : sale
      ));

      const updated = [...updatedSales, saleId];
      setUpdatedSales(updated);
      localStorage.setItem('updatedSales', JSON.stringify(updated));
      setEditingSale(null);
    } catch (error) {
      setSnackbarMessage(error.message);
      setSnackbarSeverity('error');
      setOpenSnackbar(true);
    }
  };

  const handleMarkSoldWithPaymentOption = async (sale) => {
    const totalQuantity = parseInt(sale.quantity) || 0;
  
    const pagoTodo = window.confirm("¿Pago todo o por partes?\nAceptar: Pago todo\nCancelar: Pago por partes");
  
    try {
      const token = localStorage.getItem('token');
  
      if (pagoTodo) {
        // Pago completo: enviamos la cantidad total
        const response = await fetch(`http://localhost:5000/api/sales/mark-partial-paid/${sale.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({ paidQuantity: totalQuantity }),
        });
  
        if (!response.ok) throw new Error('Error al marcar la venta como pagada completamente');
  
        setSales(prevSales => prevSales.map(s =>
          s.id === sale.id ? { ...s, paid_quantity: totalQuantity } : s
        ));
  
        // Ahora movemos la venta a la tabla de pagadas
        await handleMarkSold(sale.id);
  
        setSnackbarMessage('Venta marcada como pagada completamente');
        setSnackbarSeverity('success');
        setOpenSnackbar(true);
  
      } else {
        // Pago parcial: pedimos la cantidad pagada
        let cantidadPagadaStr = window.prompt(`Cantidad pagada (galones) de ${totalQuantity}:`, totalQuantity);
        if (cantidadPagadaStr === null) return;
  
        let cantidadPagada = parseInt(cantidadPagadaStr);
  
        if (isNaN(cantidadPagada) || cantidadPagada < 0 || cantidadPagada > totalQuantity) {
          alert("Cantidad inválida. Debe ser un número entre 0 y " + totalQuantity);
          return;
        }
  
        const response = await fetch(`http://localhost:5000/api/sales/mark-partial-paid/${sale.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({ paidQuantity: cantidadPagada }),
        });
  
        if (!response.ok) throw new Error('Error al marcar la venta como parcialmente pagada');
  
        setSales(prevSales => prevSales.map(s =>
          s.id === sale.id ? { ...s, paid_quantity: cantidadPagada } : s
        ));
  
        // Mover parte pagada a la tabla verde
        setSoldSales(prev => {
          const newSet = new Set(prev);
          newSet.add(sale.id);
          localStorage.setItem('soldSales', JSON.stringify([...newSet]));
          return newSet;
        });
  
        const restante = totalQuantity - cantidadPagada;
  
        if (restante > 0) {
          await handleMarkFiado(sale.id); // mover resto a la tabla de fiados (rojo)
        }
  
        setSnackbarMessage(`Venta actualizada: ${cantidadPagada} pagados, ${restante} fiados`);
        setSnackbarSeverity('success');
        setOpenSnackbar(true);
      }
    } catch (error) {
      setSnackbarMessage(error.message);
      setSnackbarSeverity('error');
      setOpenSnackbar(true);
    }
  };
  
  

  const handleMarkSold = async (saleId) => {
    try {
      // Marcar como vendida (cambiar fiado a false)
      const response = await fetch(`http://localhost:5000/api/sales/mark-sold/${saleId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
      });
  
      if (!response.ok) {
        throw new Error('Error al marcar la venta como exitosa');
      }
  
      setSoldSales(prevSoldSales => {
        const newSoldSales = new Set(prevSoldSales);
        if (newSoldSales.has(saleId)) {
          newSoldSales.delete(saleId); // Si ya está marcado, lo desmarcamos
        } else {
          newSoldSales.add(saleId); // Si no está marcado, lo marcamos
        }
        localStorage.setItem('soldSales', JSON.stringify([...newSoldSales]));
        return newSoldSales;
      });
  
      setSnackbarMessage('Venta marcada como exitosa');
      setSnackbarSeverity('success');
      setOpenSnackbar(true);
    } catch (error) {
      setSnackbarMessage(error.message);
      setSnackbarSeverity('error');
      setOpenSnackbar(true);
    }
  };
  
  
  const handleMarkFiado = async (saleId) => {
    try {
      /*if (fiadosSales.has(saleId)) {
        // Si ya está marcado como fiado, lo desmarcamos
        const response = await fetch(`http://localhost:5000/api/sales/unmark-fiado/${saleId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
        });
  
        if (!response.ok) {
          throw new Error('Error al desmarcar la venta como fiado');
        }
  
        setFiadosSales(prevFiadosSales => {
          const newFiadosSales = new Set(prevFiadosSales);
          newFiadosSales.delete(saleId);
          localStorage.setItem('fiadosSales', JSON.stringify([...newFiadosSales]));
          return newFiadosSales;
        });
        setSnackbarMessage('Venta desmarcada como fiado');
      } else {*/
        // Si no está marcado como fiado, lo marcamos
            // Marcar la venta como fiado
            const response = await fetch(`http://localhost:5000/api/sales/mark-fiado/${saleId}`, {
              method: 'PUT',
              headers: {
                'Content-Type': 'application/json',
              },
            });
        
            if (!response.ok) {
              throw new Error('Error al marcar la venta como fiado');
            }
        
            setFiadosSales(prevFiadosSales => {
              const newFiadosSales = new Set(prevFiadosSales);
              newFiadosSales.add(saleId);
              localStorage.setItem('fiadosSales', JSON.stringify([...newFiadosSales]));
              return newFiadosSales;
            });
        
            // Llamar a la ruta para mover los fiados a delivery_fiados
            const moveFiadoResponse = await fetch('http://localhost:5000/api/sales/mover-fiados', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ saleId })
            });
        
            if (!moveFiadoResponse.ok) {
              throw new Error('Error al mover fiado a delivery_fiados');
            }
        
            setSnackbarMessage('Venta marcada como fiado y movida a delivery_fiados');
            setSnackbarSeverity('success');
            setOpenSnackbar(true);
          } catch (error) {
            setSnackbarMessage(error.message);
            setSnackbarSeverity('error');
            setOpenSnackbar(true);
          }
        };
        
  
  const formatDate = (date) => {
    const localDate = new Date(date);
    return localDate.toLocaleString();
  };

  const generateReport = async () => {
    const doc = new jsPDF();
    doc.text("Reporte de Ventas", 14, 10);
  
    const tableColumn = ["Repartidor", "Cliente", "Ruta", "Tamaño y Cantidad", "Precio", "Fecha"];
  
    // Ventas pagadas
    doc.text("Ventas Pagadas", 14, 20);
    const paidRows = sales
      .filter(sale => soldSales.has(sale.id))
      .map(sale => {
        const paidQty = parseInt(sale.paid_quantity) || 0;
        return {
          data: [
            sale.deliveryman,
            sale.client,
            sale.route,
            `${sale.bottle_size}L x ${paidQty}`,
            `$${(sale.price * paidQty).toFixed(2)}`,
            formatDate(sale.sale_date),
          ],
          color: [144, 238, 144],
        };
      });
  
    autoTable(doc, {
      startY: 25,
      head: [tableColumn],
      body: paidRows.map(row => row.data),
      theme: "grid",
      styles: { fontSize: 10, cellPadding: 3 },
      headStyles: { fillColor: [41, 128, 185], textColor: 255, fontStyle: "bold" },
      alternateRowStyles: { fillColor: [240, 240, 240] },
      didParseCell: function (data) {
        if (data.section === "body") {
          const rowColor = paidRows[data.row.index]?.color;
          if (rowColor) data.cell.styles.fillColor = rowColor;
        }
      },
    });
  
    // Ventas fiadas
    const fiadoStartY = doc.lastAutoTable.finalY + 10;
    doc.text("Ventas Fiadas", 14, fiadoStartY);
    const fiadoRows = sales
      .filter(sale => fiadosSales.has(sale.id))
      .map(sale => {
        const paidQty = parseInt(sale.paid_quantity) || 0;
        const fiadoQty = (parseInt(sale.quantity) || 0) - paidQty;
        return {
          data: [
            sale.deliveryman,
            sale.client,
            sale.route,
            `${sale.bottle_size}L x ${fiadoQty}`,
            `$${(sale.price * fiadoQty).toFixed(2)}`,
            formatDate(sale.sale_date),
          ],
          color: [255, 204, 203],
        };
      });
  
    autoTable(doc, {
      startY: fiadoStartY + 5,
      head: [tableColumn],
      body: fiadoRows.map(row => row.data),
      theme: "grid",
      styles: { fontSize: 10, cellPadding: 3 },
      headStyles: { fillColor: [41, 128, 185], textColor: 255, fontStyle: "bold" },
      alternateRowStyles: { fillColor: [240, 240, 240] },
      didParseCell: function (data) {
        if (data.section === "body") {
          const rowColor = fiadoRows[data.row.index]?.color;
          if (rowColor) data.cell.styles.fillColor = rowColor;
        }
      },
    });
  
    // Totales
    const total = calculateTotal();
    const totalFiados = calculateTotalFiados();
    const totalExpenses = calculateTotalExpenses();
    const netTotal = total - totalExpenses;
    const totalY = doc.lastAutoTable.finalY + 10;
  
    doc.text(`Total ventas: $${total.toFixed(2)}`, 14, totalY);
    doc.text(`Fiados: $${totalFiados.toFixed(2)}`, 14, totalY + 10);
    doc.text(`Gastos: $${totalExpenses.toFixed(2)}`, 14, totalY + 20);
    doc.text(`Total Neto: $${netTotal.toFixed(2)}`, 14, totalY + 30);
  
    // Guardar en la computadora
    doc.save("Reporte_Ventas.pdf");
  
    // Obtener PDF como blob
    const pdfBlob = doc.output("blob");
  
    // Convertir blob a base64
    const toBase64 = (blob) =>
      new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result.split(",")[1]); // solo base64
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
  
    const pdfBase64 = await toBase64(pdfBlob);
    const filename = `Reporte_Ventas_${new Date().toISOString().split("T")[0]}.pdf`;
  
    // Construir texto para guardar con separación y emojis para frontend
    let reportText = "Ventas Pagadas\n";
    paidRows.forEach(row => {
      reportText += `🟢 ${row.data.join(" | ")}\n`;
    });
  
    reportText += "\nVentas Fiadas\n";
    fiadoRows.forEach(row => {
      reportText += `🔴 ${row.data.join(" | ")}\n`;
    });
  
    reportText += `\nTotal: $${total.toFixed(2)}\nFiados: $${totalFiados.toFixed(2)}\nGastos: $${totalExpenses.toFixed(2)}\nTotal Neto: $${netTotal.toFixed(2)}`;
  
    try {
      // Enviar todo en una sola petición
      const response = await fetch("http://localhost:5000/api/reports/save-report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pdfBase64, filename, reportData: reportText }),
      });
  
      if (!response.ok) throw new Error("Error al guardar el reporte en la base de datos");
  
      // Borrar ventas y gastos después de guardar
      await fetch("http://localhost:5000/api/sales/delete-all", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
      });
  
      await fetch("http://localhost:5000/api/expenses/delete-all", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
      });
  
      // Limpiar estados locales
      setExpenses([]);
      setSales([]);
      setUpdatedSales([]);
      setSoldSales(new Set());
      setFiadosSales(new Set());
      localStorage.removeItem("updatedSales");
      localStorage.removeItem("soldSales");
      localStorage.removeItem("fiadosSales");
  
      setSnackbarMessage("Reporte generado y ventas eliminadas");
      setSnackbarSeverity("success");
      setOpenSnackbar(true);
    } catch (error) {
      setSnackbarMessage(error.message);
      setSnackbarSeverity("error");
      setOpenSnackbar(true);
    }
  };
  

  const calculateTotal = () => {
    return sales
      .filter(sale => soldSales.has(sale.id)) // Solo ventas pagadas
      .reduce((acc, sale) => {
        const salePrice = parseFloat(sale.price) || 0;
        const paidQty = parseInt(sale.paid_quantity) || 0;
        return acc + (salePrice * paidQty);
      }, 0);
  };
  
  const total = calculateTotal();
  
  const toggleTotal = () => {
    setShowTotal(!showTotal);
  };
  
  const calculateTotalExpenses = () => {
    return expenses.reduce((acc, expense) => acc + (parseFloat(expense.amount) || 0), 0);
  };
  
  const totalExpenses = calculateTotalExpenses();
  const netTotal = total - totalExpenses;

  const calculateTotalFiados = () => {
    return sales
      .filter(sale => fiadosSales.has(sale.id))
      .reduce((acc, sale) => {
        const salePrice = parseFloat(sale.price) || 0;
        const fiadoQty = parseInt(sale.quantity) - parseInt(sale.paid_quantity) || 0;
        return acc + (salePrice * fiadoQty);
      }, 0);
  };
  
  const totalFiados = calculateTotalFiados();
  
  
  return (
    <div style={{ padding: '20px', background: 'linear-gradient(135deg, #d4e8f5, #c9d9e6)' }}>
       {!modoAdmin && (
        <Button
          variant="outlined"
          color="primary"
          onClick={() => navigate("/delivery-sales")}
          sx={{ mb: 3 }}
        >
          Volver a Registrar Venta
        </Button>
      )}

       <TableContainer component={Paper}>
        <Table ref={tableRef}>
          <TableHead>
            <TableRow>
              <TableCell>Repartidor</TableCell>
              <TableCell>Ruta</TableCell>
              <TableCell>Cliente</TableCell>
              <TableCell>Tamaño y Cantidad</TableCell>
              <TableCell>Precio</TableCell>
              <TableCell>Fecha</TableCell>

              {/* Ocultar columnas "Editar" y "Acciones" para admin */}
              {!modoAdmin && <TableCell>Editar</TableCell>}
              {!modoAdmin && <TableCell>Acciones</TableCell>}
            </TableRow>
          </TableHead>
          <TableBody>
            {sales.map((sale) => (
              <TableRow
                key={sale.id}
                style={{
                  backgroundColor: soldSales.has(sale.id)
                    ? '#90EE90'
                    : fiadosSales.has(sale.id)
                    ? '#FFCCCB'
                    : 'transparent',
                  color: soldSales.has(sale.id) || fiadosSales.has(sale.id)
                    ? 'white'
                    : 'black',
                }}
              >
                <TableCell>
                  {editingSale === sale.id && !modoAdmin ? (
                    <Select
                      value={sale.deliveryman || ''}
                      onChange={(e) => handleUpdateDeliveryman(sale.id, e.target.value)}
                    >
                      {deliverymen.map((r) => (
                        <MenuItem key={r.id} value={r.name}>{r.name}</MenuItem>
                      ))}
                    </Select>
                  ) : (
                    <span style={{ fontWeight: updatedSales.includes(sale.id) ? 'bold' : 'normal' }}>
                      {sale.deliveryman}
                    </span>
                  )}
                </TableCell>
                <TableCell>{sale.route}</TableCell>
                <TableCell>{sale.client}</TableCell>
                <TableCell>{sale.bottle_size}L x {sale.quantity}</TableCell>
                <TableCell>${sale.price * sale.quantity}</TableCell>
                <TableCell>{formatDate(sale.sale_date)}</TableCell>

                {/* Solo mostrar el botón editar si no es admin */}
                {!modoAdmin && (
                  <TableCell>
                    <IconButton color="primary" onClick={() => setEditingSale(sale.id)}>
                      <Person />
                    </IconButton>
                  </TableCell>
                )}

                {/* Solo mostrar los botones de acciones si no es admin */}
                {!modoAdmin && (
                  <TableCell>
                    <IconButton
                      color="success"
                      onClick={() => {
                        if (!fiadosSales.has(sale.id)) {
                          handleMarkSoldWithPaymentOption(sale);
                        }
                      }}
                      style={{
                        backgroundColor: soldSales.has(sale.id) ? '#90EE90' : 'transparent',
                      }}
                    >
                      <ArrowForward />
                    </IconButton>

                    <IconButton
                      color={fiadosSales.has(sale.id) ? 'error' : 'default'}
                      onClick={() => {
                        if (!soldSales.has(sale.id)) {
                          handleMarkFiado(sale.id);
                        }
                      }}
                      style={{
                        backgroundColor: fiadosSales.has(sale.id) ? '#FFCCCB' : 'transparent',
                      }}
                    >
                      <Cancel />
                    </IconButton>
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      {/* Segunda tabla - Pagados (Verde) */}
<Typography variant="h6" sx={{ mt: 3 }}>Ventas Pagadas</Typography>
<TableContainer component={Paper}>
  <Table>
    <TableHead>
      <TableRow>
      <TableCell>Repartidor</TableCell>
        <TableCell>Cliente</TableCell>
        <TableCell>Ruta</TableCell>
        <TableCell>Cantidad</TableCell>
        <TableCell>Fecha</TableCell>
      </TableRow>
    </TableHead>
    <TableBody>
      {sales.filter(sale => soldSales.has(sale.id)).map(sale => (
        <TableRow key={sale.id} style={{ backgroundColor: "#d4edda" }}>
          <TableCell>{sale.deliveryman}</TableCell>
          <TableCell>{sale.client}</TableCell>
          <TableCell>{sale.route}</TableCell>
          <TableCell>{sale.bottle_size}L x {sale.paid_quantity} = ${sale.price * sale.paid_quantity}</TableCell> {/* Solo la parte pagada */}
          <TableCell>{formatDate(sale.sale_date)}</TableCell>
        </TableRow>
      ))}
    </TableBody>
  </Table>
</TableContainer>

{/* Tercera tabla - Fiados (Rojo) */}
<Typography variant="h6" sx={{ mt: 3 }}>Ventas Fiadas</Typography>
<TableContainer component={Paper}>
  <Table>
    <TableHead>
      <TableRow>
      <TableCell>Repartidor</TableCell>
        <TableCell>Cliente</TableCell>
        <TableCell>Ruta</TableCell>
        <TableCell>Cantidad</TableCell>
        <TableCell>Fecha</TableCell>
      </TableRow>
    </TableHead>
    <TableBody>
      {sales.filter(sale => fiadosSales.has(sale.id)).map(sale => (
        <TableRow key={sale.id} style={{ backgroundColor: "#f8d7da" }}>
          <TableCell>{sale.deliveryman}</TableCell>
          <TableCell>{sale.client}</TableCell>
          <TableCell>{sale.route}</TableCell>
          <TableCell>  {sale.bottle_size}L x {sale.quantity - sale.paid_quantity} = ${sale.price * (sale.quantity - sale.paid_quantity)}
          </TableCell> {/* Solo la parte fiada */}
          <TableCell>{formatDate(sale.sale_date)}</TableCell>
          </TableRow>
      ))}
    </TableBody>
  </Table>
</TableContainer>


      {/* Tabla de gastos */}
      <Typography variant="h6" style={{ marginTop: '40px', marginBottom: '10px' }}>
      </Typography> Gastos
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
            <TableCell></TableCell>
              <TableCell>Descripción</TableCell>
              <TableCell>Cantidad</TableCell>
              <TableCell>Fecha</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {expenses.map((expense) => (
              <TableRow key={expense.id}>
                <TableCell>{}</TableCell>
                <TableCell>{expense.description}</TableCell>
                <TableCell>${expense.amount}</TableCell>
                <TableCell>{new Date(expense.created_at).toLocaleString('es-MX')}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {showTotal && (
        <Typography variant="h6" style={{ marginTop: '20px' }}>Total ventas: ${total}
        <Typography variant="h6" color="error">Total Fiado: ${totalFiados.toFixed(2)}</Typography>
          <Typography variant="h6" color="error">Total Gastos: ${totalExpenses.toFixed(2)}</Typography>
          <Typography variant="h6" sx={{ fontWeight: 'bold' }}> Total: ${netTotal.toFixed(2)}
    </Typography>
        </Typography>
      )}

       {!modoAdmin && (
        <>
          <Button
            variant="outlined"
            color="primary"
            onClick={toggleTotal}
            style={{ marginTop: '10px' }}
          >
            {showTotal ? 'Ocultar Total' : 'Mostrar Total'}
          </Button>

          <Button
            variant="outlined"
            color="secondary"
            onClick={generateReport}
            disabled={!canGenerateReport}
            style={{ marginTop: "10px", marginLeft: "10px" }}
          >
            Generar Reporte
          </Button>
        </>
      )}

      {/* Snackbar siempre se puede mostrar */}
      <Snackbar
        open={openSnackbar}
        autoHideDuration={6000}
        onClose={() => setOpenSnackbar(false)}
      >
        <Alert
          onClose={() => setOpenSnackbar(false)}
          severity={snackbarSeverity}
          sx={{ width: '100%' }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </div>
  );
};
export default SalesList;
