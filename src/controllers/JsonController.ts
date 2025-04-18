import fs  from 'fs';
import path from 'path';

export async function readJSON(filePath: string): Promise<any> {
  try {

    const fullPath = path.resolve(filePath);
    const data = fs.readFileSync(fullPath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    throw new Error(`Error leyendo el archivo JSON: ${console.log(error)}`);
  }
}