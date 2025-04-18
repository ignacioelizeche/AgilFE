import { Request, Response } from 'express';
import { readJSON } from './JsonController';
import xmlgen from 'facturacionelectronicapy-xmlgen';
import xmlsign from 'facturacionelectronicapy-xmlsign';
import setApi from 'facturacionelectronicapy-setapi';
import he from 'he';
import * as fs from 'fs';
import * as path from 'path';
import { parseStringPromise } from 'xml2js';

export const generateXML = async (req: Request, res: Response) => {
  try {
    const { params, data, options } = req.body;

    const parameters = await readJSON(params);
    const invoice = await readJSON(data);
    let xmlString = await xmlgen.generateXMLDE(parameters, invoice, options);

    // Encode the XML string to handle special characters
    xmlString = he.encode(xmlString);

    res.json({ success: true, xml: xmlString });
  } catch (error: any) {
    // Captura el mensaje del error
    const errorMessage = error.message || 'Error desconocido al generar el XML';

    // Imprime el error completo para depuración
    console.error('Error generando XML:', error);

    // Responde con el mensaje específico del error
    res.status(500).json({
      success: false,
      error: errorMessage,
    });
  }
};

export const firmarXML = async (req: Request, res: Response) => {
  try {
    const { xmlString, certPath, key } = req.body;

    // Decodificar el XML
    const decodedXML = he.decode(xmlString);

    // Firmar el XML
    const signedXML = await xmlsign.signXML(decodedXML, certPath, key);

    // Crear una ruta para guardar el archivo firmado
    const outputFilePath = path.join(__dirname, `signedXML_${Date.now()}.xml`);

    // Guardar el archivo XML firmado en el sistema de archivos
    await fs.promises.writeFile(outputFilePath, signedXML, 'utf8');

    // Enviar respuesta con el archivo guardado
    res.json({ success: true, message: 'XML firmado y guardado correctamente.', filePath: outputFilePath });
  } catch (error: any) {
    // Captura el mensaje del error
    const errorMessage = error.message || 'Error desconocido al firmar el XML';
    console.error('Error firmando XML:', error);
    res.status(500).json({
      success: false,
      error: errorMessage,
    });
  }
};







// export const firmarXML = async (req: Request, res: Response) => {
//   try {
//     const { xmlString, certPath, key } = req.body;


//     const decodedXML = he.decode(xmlString);

//     const signedXML = await xmlsign.signXML(decodedXML, certPath, key);

//     res.json({ success: true, signedXML });
//   } catch (error: any) {
//     // Captura el mensaje del error
//     const errorMessage = error.message || 'Error desconocido al firmar el XML';
//     console.error('Error firmando XML:', error);
//     res.status(500).json({
//       success: false,
//       error: errorMessage,
//     });
//   }
// };

export const consultarRUC = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id, ruc, env, certPath, key } = req.body;

    // Validación de los parámetros requeridos
    if (!id || !ruc || !env || !certPath || !key) {
      res.status(400).json({
        success: false,
        error: 'Faltan parámetros requeridos: id, ruc, env, certPath, key',
      });
      return;
    }

    // Llamada a la función consultaRuc
    const response = await setApi.consultaRUC(id, ruc, env, certPath, key);

    res.json({ success: true, data: response });
  } catch (error: any) {
    console.error('Error en consultaRuc:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Error interno del servidor',
    });
  }
};



export const consultarLote = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id, lote, env, certPath, key } = req.body; // Usar parámetros query para la consulta

    // Validación de los parámetros requeridos
    if (!id || !lote || !env || !certPath || !key) {
      res.status(400).json({
        success: false,
        error: 'Faltan parámetros requeridos: id, lote, env, certPath, key',
      });
      return;
    }

    // Llamada a la función consultaLote de la API
    const response = await setApi.consultaLote(id, lote, env, certPath, key);

    res.json({ success: true, data: response });
  } catch (error: any) {
    console.error('Error en consultaLote:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Error interno del servidor',
    });
  }
};



export const enviardocumento = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id, signedXMLPath, env, certPath, key } = req.body;
    const timeout = 1200000; // Timeout de 20 minutos

    // Validación de los parámetros requeridos
    if (!id || !signedXMLPath || !env || !certPath || !key) {
      res.status(400).json({
        success: false,
        error: 'Faltan parámetros requeridos: id, signedXMLPath, env, certPath, key',
      });
      return;
    }

    // Leer el archivo XML desde el path proporcionado
    const xmlContent = fs.readFileSync(signedXMLPath, 'utf8');

    // Convertir el contenido XML a JSON
    const xmlToJson = await parseStringPromise(xmlContent);

    // Convertir el JSON a un string para enviarlo
    const formateado = JSON.stringify(xmlToJson);

    // Llamada a la API para enviar el documento
    const response = await setApi.recibe(id, formateado, env, certPath, key, { timeout });

    // Respuesta exitosa con los datos de la API
    res.json({ success: true, data: response });
  } catch (error: any) {
    console.error('Error en envío de documento:', error);

    // Manejo detallado de errores
    res.status(500).json({
      success: false,
      error: error.message || 'Error interno del servidor',
    });
  }
};

// export const enviardocumento = async (req: Request, res: Response): Promise<void> => {
//   try {
//     const { id, signedXML, env, certPath, key } = req.body;
//     const timeout = 1200000;

//     // Validación de los parámetros requeridos
//     if (!id || !signedXML || !env || !certPath || !key) {
//       res.status(400).json({
//         success: false,
//         error: 'Faltan parámetros requeridos: id, ruc, env, certPath, key',
//       });
//       return;
//     }
    

//     const formateado = (signedXML);
//     // Llamada a la función consultaRuc
//     const response = await setApi.recibe(id, formateado, env, certPath, key, { timeout });

//     res.json({ success: true, data: response });
//   } catch (error: any) {
//     console.error('Error en envio de documento:', error);
//     res.status(500).json({
//       success: false,
//       error: error.message || 'Error interno del servidor',
//     });
//   }
// };
