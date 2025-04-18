import express from 'express';

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
  res.send('API funcionando correctamente.');
});

// Importar rutas
import xmlRoutes from './routes/xmlRoutes';
app.use('/agilekuatia/api/', xmlRoutes);

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
