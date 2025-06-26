import { useEffect, useState } from 'react';
import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, Typography, CircularProgress
} from '@mui/material';

const DeliveryReports = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/reports/get-reports');
        const data = await response.json();
        setReports(data);
      } catch (error) {
        console.error('Error al obtener los reportes:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchReports();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <CircularProgress color="primary" />
      </div>
    );
  }

  return (
    <div className="p-8 bg-gradient-to-br from-blue-100 to-blue-200 min-h-screen">
      <Typography variant="h4" align="center" gutterBottom sx={{ fontWeight: 'bold', color: '#1e3a8a' }}>
        📄 Reportes Guardados
      </Typography>

      {reports.length === 0 ? (
        <Typography align="center" variant="body1" color="textSecondary">
          No hay reportes disponibles.
        </Typography>
      ) : (
        <TableContainer component={Paper} sx={{ mt: 4, borderRadius: 3, boxShadow: 3 }}>
          <Table>
            <TableHead sx={{ backgroundColor: '#bfdbfe' }}>
              <TableRow>
                <TableCell><strong>Fecha de Generación</strong></TableCell>
                <TableCell><strong>Contenido del Reporte</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {reports.map((report) => {
                const lines = report.report_data.split('\n');

                return (
                  <TableRow key={report.id} hover>
                    <TableCell>{new Date(report.generated_at).toLocaleString()}</TableCell>
                    <TableCell>
                      <pre
                        className="whitespace-pre-wrap font-mono text-sm p-2 rounded-xl max-h-64 overflow-auto"
                        style={{ backgroundColor: '#f0f4f8' }}
                      >
                        {lines.map((line, index) => {
                          const lowerLine = line.toLowerCase();
                          let style = {};

                          if (lowerLine.includes('ventas pagadas')) {
                            style = { color: '#198754', fontWeight: 'bold' }; // verde título
                          } else if (lowerLine.includes('ventas fiadas')) {
                            style = { color: '#dc3545', fontWeight: 'bold' }; // rojo título
                          } else if (lowerLine.includes('(pagado)')) {
                            style = { color: '#198754' }; // verde fila
                          } else if (lowerLine.includes('(fiado)')) {
                            style = { color: '#dc3545' }; // rojo fila
                          }

                          return (
                            <div key={index} style={style}>
                              {line}
                            </div>
                          );
                        })}
                      </pre>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </div>
  );
};

export default DeliveryReports;
