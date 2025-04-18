import { Router } from 'express';
import { generateXML, firmarXML, consultarRUC, consultarLote, enviardocumento } from '../controllers/xmlController';

const router = Router();


//generar archivo XML
router.post('/generate', generateXML);

//firmar archivo XML
router.post('/sign', firmarXML);

//consultar RUC
router.post('/consultaruc', consultarRUC);

//consultar lote XML
router.get('/consultalote', consultarLote);

//enviar archivo XML al Set
router.post('/enviodocumento', enviardocumento);

export default router;
