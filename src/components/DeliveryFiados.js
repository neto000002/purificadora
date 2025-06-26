import React, { useState, useEffect } from 'react';
import {
  Container, Typography, Paper, Table, TableHead, TableBody,
  TableRow, TableCell, Snackbar, Alert, Button, Dialog,
  DialogTitle, DialogContent, DialogActions, TextField
} from '@mui/material';

const DeliveryFiados = ({ modoAdmin = false }) => {
  const [fiados, setFiados] = useState([]);
  const [pagados, setPagados] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showTotal, setShowTotal] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [currentFiado, setCurrentFiado] = useState(null);
  const [cantidadParcial, setCantidadParcial] = useState('');
  

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const resFiados = await fetch('http://localhost:5000/api/sales/delivery-fiados');
        if (!resFiados.ok) throw new Error('Error al obtener las ventas fiadas');
        const dataFiados = await resFiados.json();
        setFiados(dataFiados);

        const resPagados = await fetch('http://localhost:5000/api/fiados/fiados_pagados');
        if (!resPagados.ok) throw new Error('Error al obtener las ventas pagadas');
        const dataPagados = await resPagados.json();
        setPagados(dataPagados);

        setError(null);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const groupedFiados = fiados.reduce((acc, fiado) => {
    const clientName = fiado.client;
    if (!acc[clientName]) {
      acc[clientName] = {
        client: clientName,
        total: 0,
        route: fiado.route,
        sale_date: fiado.sale_date,
        ids: [],
        bottle_sizes_qty: {},
      };
    }

    const cantidadRestante = Math.max(0, parseFloat(fiado.quantity) - (parseFloat(fiado.paid_quantity) || 0));
    acc[clientName].total += cantidadRestante * parseFloat(fiado.price);
    acc[clientName].ids.push(fiado.id);

    if (fiado.original_sale_id && fiado.original_sale_id !== fiado.id) {
      acc[clientName].ids.push(fiado.original_sale_id);
    }

    const size = fiado.bottle_size;
    //const quantity = parseInt(fiado.quantity) || 0;
    if (!acc[clientName].bottle_sizes_qty[size]) {
      acc[clientName].bottle_sizes_qty[size] = 0;
    }
    acc[clientName].bottle_sizes_qty[size] += cantidadRestante;

    if (new Date(fiado.sale_date) > new Date(acc[clientName].sale_date)) {
      acc[clientName].sale_date = fiado.sale_date;
    }
    return acc;
  }, {});

  const groupedFiadosArray = Object.values(groupedFiados).map(fiado => ({
    ...fiado,
    bottle_size: Object.entries(fiado.bottle_sizes_qty)
      .map(([size, qty]) => `${size} L x ${qty}`)
      .join(', '),
  }));

  const groupedPagados = pagados.reduce((acc, pago) => {
    const clientName = pago.client;
    if (!acc[clientName]) {
      acc[clientName] = {
        client: clientName,
        total: 0,
        route: pago.route,
        sale_date: pago.sale_date,
        ids: [],
        bottle_sizes_qty: {},
      };
    }

    acc[clientName].total += parseFloat(pago.total_pagado || pago.total) || 0;
    acc[clientName].ids.push(pago.id);

    const size = pago.bottle_size;
    const quantity = parseInt(pago.quantity) || 0;
    if (!acc[clientName].bottle_sizes_qty[size]) {
      acc[clientName].bottle_sizes_qty[size] = 0;
    }
    acc[clientName].bottle_sizes_qty[size] += quantity;

    if (new Date(pago.sale_date) > new Date(acc[clientName].sale_date)) {
      acc[clientName].sale_date = pago.sale_date;
    }

    return acc;
  }, {});

  const groupedPagadosArray = Object.values(groupedPagados).map(pago => ({
    ...pago,
    bottle_size: Object.entries(pago.bottle_sizes_qty)
      .map(([size, qty]) => `${size} L x ${qty}`)
      .join(', '),
  }));

  const totalFiados = groupedFiadosArray.reduce((acc, f) => acc + (parseFloat(f.total) || 0), 0);
  const totalPagados = groupedPagadosArray.reduce((acc, p) => acc + (parseFloat(p.total) || 0), 0);

  const handlePagarTotal = async (fiado) => {
    try {
      const ventasCliente = fiados.filter(f =>
        fiado.ids.includes(f.id) || fiado.ids.includes(f.original_sale_id)
      );

      for (const venta of ventasCliente) {
        const res = await fetch('http://localhost:5000/api/fiados/fiado-pagado', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            sale_id: venta.id,
            client: venta.client,
            bottle_size: venta.bottle_size,
            price: venta.price,
            route: venta.route,
            sale_date: venta.sale_date,
            paid_quantity: Math.max(0, parseFloat(venta.quantity) - (parseFloat(venta.paid_quantity) || 0)),
            is_partial: false,
            original_sale_id: venta.original_sale_id || venta.id,
            total_pagado: Math.max(0, parseFloat(venta.quantity) - (parseFloat(venta.paid_quantity) || 0)) * venta.price
          }),
        });

        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(`Error al marcar venta con ID ${venta.id}: ${errorData.message || res.statusText}`);
        }
      }

      setPagados(prev => [...prev, ...ventasCliente]);
      setFiados(prev =>
        prev.filter(f => !fiado.ids.includes(f.id) && !fiado.ids.includes(f.original_sale_id))
      );

    } catch (error) {
      alert(error.message);
      console.error('Error en handlePagarTotal:', error);
    }
  };

  const handleOpenPagoParcial = (fiadoAgrupado) => {
  // Encuentra la primera venta real (con id) del cliente
  const ventaBase = fiados.find(f =>
    fiadoAgrupado.ids.includes(f.id) || fiadoAgrupado.ids.includes(f.original_sale_id)
  );

  if (!ventaBase) {
    alert("No se encontró una venta válida para este cliente.");
    return;
  }

  setCurrentFiado(ventaBase); // ✅ Este sí tiene todos los datos necesarios
  setCantidadParcial('');
  setOpenDialog(true);
};


 const handleConfirmarPagoParcial = async () => {
  const cantidad = parseFloat(cantidadParcial);

  if (isNaN(cantidad) || cantidad <= 0) {
    alert("Ingresa una cantidad válida");
    return;
  }

  const payload = {
    // Enviar original_sale_id como sale_id para que el backend identifique la venta original
    sale_id: currentFiado.original_sale_id || currentFiado.id,
    client: currentFiado.client,
    bottle_size: currentFiado.bottle_size,
    price: currentFiado.price,
    route: currentFiado.route,
    sale_date: currentFiado.sale_date,
    paid_quantity: cantidad,
    original_sale_id: currentFiado.original_sale_id || currentFiado.id,
    total_pagado: cantidad * currentFiado.price,
    deliveryman: currentFiado.deliveryman
  };

  console.log("Payload que se envía al backend:", payload);

  try {
    const res = await fetch('http://localhost:5000/api/fiados/fiado-parcial', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.message || "Error al registrar el pago parcial");
    }

    // Actualizar listas de fiados y pagados
    const resFiados = await fetch('http://localhost:5000/api/sales/delivery-fiados');
    const dataFiados = await resFiados.json();
    setFiados(dataFiados);

    const resPagados = await fetch('http://localhost:5000/api/fiados/fiados_pagados');
    const dataPagados = await resPagados.json();
    setPagados(dataPagados);

    setOpenDialog(false);
  } catch (err) {
    alert(err.message);
    console.error(err);
  }
};




  if (loading) return <Typography align="center" style={{ marginTop: 40 }}>Cargando...</Typography>;

  return (
    <Container maxWidth="lg" style={{ marginTop: 40 }}>
      <Paper elevation={3} style={{ padding: 20, marginBottom: 30, background: 'linear-gradient(135deg, #d4e8f5, #c9d9e6)' }}>
        <Typography variant="h5" gutterBottom style={{ color: '#0062A3' }}>Fiados Pendientes</Typography>

        {error && (
          <Snackbar open={!!error} autoHideDuration={6000} onClose={() => setError(null)}>
            <Alert severity="error">{error}</Alert>
          </Snackbar>
        )}

        <Table>
          <TableHead>
            <TableRow style={{ backgroundColor: '#0062A3' }}>
              <TableCell style={{ color: '#fff' }}>Cliente</TableCell>
              <TableCell style={{ color: '#fff' }}>Tamaño</TableCell>
              <TableCell style={{ color: '#fff' }}>Monto Total</TableCell>
              <TableCell style={{ color: '#fff' }}>Ruta</TableCell>
              <TableCell style={{ color: '#fff' }}>Última Fecha de Venta</TableCell>
              {!modoAdmin && <TableCell style={{ color: '#fff' }}>Acción</TableCell>}
            </TableRow>
          </TableHead>
          <TableBody>
            {groupedFiadosArray.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center">No hay fiados pendientes</TableCell>
              </TableRow>
            ) : (
              groupedFiadosArray.map(fiado => (
                <TableRow key={fiado.client}>
  <TableCell>{fiado.client}</TableCell>
  <TableCell>{fiado.bottle_size}</TableCell>
  <TableCell>${fiado.total.toFixed(2)}</TableCell>
  <TableCell>{fiado.route}</TableCell>
  <TableCell>{new Date(fiado.sale_date).toLocaleString()}</TableCell>
  {!modoAdmin && (
    <TableCell>
      <Button
        variant="outlined"
        color="success"
        size="small"
        onClick={() => handlePagarTotal(fiado)}
      >
        Pagar todo
      </Button>
      <Button
        variant="outlined"
        color="warning"
        size="small"
        style={{ marginLeft: 8 }}
        onClick={() => handleOpenPagoParcial(fiado)}
      >
        Pago parcial
      </Button>
    </TableCell>
  )}
</TableRow>

              ))
            )}
          </TableBody>
        </Table>

        {showTotal && (
          <Typography variant="h6" style={{ marginTop: 20, color: '#0062A3' }}>
            Total Fiados: ${totalFiados.toFixed(2)}
          </Typography>
        )}

        <Button
          variant="outlined"
          color="primary"
          onClick={() => setShowTotal(!showTotal)}
          style={{ marginTop: 10, borderColor: '#0062A3', color: '#0062A3' }}
        >
          {showTotal ? 'Ocultar Total' : 'Mostrar Total'}
        </Button>
      </Paper>

      <Paper elevation={3} style={{ padding: 20, backgroundColor: '#d0f0d8' }}>
        <Typography variant="h5" gutterBottom style={{ color: '#27632a' }}>Fiados Pagados</Typography>

        <Table>
          <TableHead>
            <TableRow style={{ backgroundColor: '#27632a' }}>
              <TableCell style={{ color: '#fff' }}>Cliente</TableCell>
              <TableCell style={{ color: '#fff' }}>Tamaño</TableCell>
              <TableCell style={{ color: '#fff' }}>Monto Pagado</TableCell>
              <TableCell style={{ color: '#fff' }}>Ruta</TableCell>
              <TableCell style={{ color: '#fff' }}>Fecha de Pago</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {groupedPagadosArray.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} align="center">No hay fiados pagados</TableCell>
              </TableRow>
            ) : (
              groupedPagadosArray.map(pago => (
                <TableRow key={pago.client + '-pagado'}>
                  <TableCell>{pago.client}</TableCell>
                  <TableCell>{pago.bottle_size}</TableCell>
                  <TableCell>${pago.total.toFixed(2)}</TableCell>
                  <TableCell>{pago.route}</TableCell>
                  <TableCell>{new Date(pago.sale_date).toLocaleString()}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        <Typography variant="h6" style={{ marginTop: 20, color: '#27632a' }}>
          Total Pagado: ${totalPagados.toFixed(2)}
        </Typography>
      </Paper>

      {!modoAdmin && (
  <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
    <DialogTitle>Pagar parcialmente</DialogTitle>
    <DialogContent>
      <TextField
        autoFocus
        margin="dense"
        label="Cantidad de galones a pagar"
        type="number"
        fullWidth
        value={cantidadParcial}
        onChange={(e) => setCantidadParcial(e.target.value)}
      />
    </DialogContent>
    <DialogActions>
      <Button onClick={() => setOpenDialog(false)}>Cancelar</Button>
      <Button onClick={handleConfirmarPagoParcial} color="primary">Confirmar</Button>
    </DialogActions>
  </Dialog>
)}
    </Container>
  );
};

export default DeliveryFiados;
