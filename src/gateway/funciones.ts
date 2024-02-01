import { accessToken } from './config';
import axios from 'axios';
import * as fs from 'fs';
import * as path from 'path';

//Obtener las carpetas OneDrive Principal
export async function getOneDriveFolders(accessToken:string, urlp: string): Promise<{ folders: any[]; files: any[] }> { 

    try {
      const response = await axios.get(
        urlp,
        {headers: { Authorization: `Bearer ${accessToken}`, },  },
      );

      const folders = response.data.value
          .filter((item: any) => item.folder)
          .map((item: any) => ({
            name: item.name, 
            id: item.id
          }));

        const files = response.data.value
          .filter((item: any) => item.file)
          .map((item: any) => ({
            
            name: item.name,
            id: item.id
          }));
        return { folders, files };
        
    } catch (error) {
      this.server.emit("tockenInvalido", "El token de acceso ha caducado")
      throw new Error('Error al obtener las carpetas de OneDrive');
    }
}

//Descargar archivos
export async function downloadFile(accessToken: string, folderContenId: string,   rutaDescargas:string) {

    try {
      const response = await axios.get(
        `https://graph.microsoft.com/v1.0/me/drive/items/${folderContenId}/content`,
        {
          responseType: 'stream',
          headers: {
            Authorization: `Bearer ${accessToken}`, 
          },
        }, 
      );

      const response2 = await axios.get(
        `https://graph.microsoft.com/v1.0/me/drive/items/${folderContenId}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      const downloadSize = parseInt(response.headers['content-length'], 10);
      const fileSize = response2.data.size  ;
      const contentType = response.headers['content-type'];
      

      const contentDispositionHeader = response.headers['content-disposition'];
      const decodedContentDisposition = decodeURIComponent(contentDispositionHeader);
      const filenameMatch = decodedContentDisposition.match(/filename\*?=['"]?(?:UTF-\d['"]*)?([^;\r\n"']*)['"]?;?/i);
      const filename = filenameMatch ? filenameMatch[1] : 'file';
      const filePath = path.join(rutaDescargas, filename);
      let alertaExt = false;
      //###############################################################################

      if(contentType == 'text/plain'){
        alertaExt = true;
        //Comprovar ruta de descarga 
        if (!fs.existsSync(rutaDescargas)){ 
          fs.mkdirSync(rutaDescargas, { recursive: true });
        }      
        const writeStream = fs.createWriteStream(filePath);
        response.data.pipe(writeStream);

        
        await new Promise<void>((resolve, reject) => {
          writeStream.on('finish', () => {
            resolve();
          });
          writeStream.on('error', (error) => {
            reject(error);
          });
        });
      }else{
        if(downloadSize == fileSize){
          
          if(!fs.existsSync(filePath)){
            console.log(downloadSize, fileSize);
            alertaExt = true;
            //Comprovar ruta de descarga 
            if (!fs.existsSync(rutaDescargas)){ 
              fs.mkdirSync(rutaDescargas, { recursive: true });
            }      
            const writeStream = fs.createWriteStream(filePath);
            response.data.pipe(writeStream);

            await new Promise<void>((resolve, reject) => {
              writeStream.on('finish', () => {
                resolve();
              });
              writeStream.on('error', (error) => {
                reject(error);
              });
            });
          }
        }else{
          throw new Error('El tamaño del archivo descargado no coincide con el tamaño esperado.');
        }
      }
      //###############################################################################
    if (alertaExt){
      return alertaExt
    }
    } catch (error) {
        this.server.emit('descargaNoCompletada', 'La descarga no se ha podido completar');
        console.log(error);
    }
}

//Acceder al contenido de las carpetas
export async function getFolderContent(accessToken: string, folderId: string): Promise<{folders: any[]; files: any[]}> {
    
    try {
      const response = await axios.get(
        `https://graph.microsoft.com/v1.0/me/drive/items/${folderId}/children`,
        {headers: { Authorization: `Bearer ${accessToken}`, }, },
      );
      
      const folders = response.data.value
        .filter((item: any) => item.folder)
        .map((item: any) => ({
          name: item.name,
          id: item.id
        }));

      const files = response.data.value
        .filter((item: any) => item.file)
        .map((item: any) => ({
          name: item.name,
          id: item.id
        }));

      return { folders, files };
      
    } catch (error) {
      this.server.emit('ocultarLoader')
      console.log(error);
      throw new Error('Error al obtener el contenido de la carpeta');
    }
  }


export async function downloadFolder(folderId: string, nameFolder: string, rutaDescarga: string, accessToken: string) {

  try {
    const constResponse = await axios.get(
      `https://graph.microsoft.com/v1.0/me/drive/items/${folderId}/children`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    const items = constResponse.data.value;
    const folderPath = path.join(rutaDescarga, nameFolder);
    
    if (!fs.existsSync(folderPath)) {
      fs.mkdirSync(folderPath, { recursive: true });
    }
    
    const promises = items.map(async (item: any) => {
      if (item.folder) {
        await downloadFolder(item.id, item.name, folderPath, accessToken);
      } else if (item.file) {
        await downloadFile(accessToken, item.id, folderPath);
      }
    });
    

    await Promise.all(promises);
    
    
  } catch (error) {
    console.error('Error al descargar la carpeta', error.message);
    throw new Error('Error al descargar la carpeta');
  }
}

export async function verifyContent(contenido:object, ruta: string) { // verifica si el contenido que hay dentro de una carpeta exite 
  const folders1 = contenido["folders"];
  const files1 = contenido["files"];

  const folders: { name: string; id: string }[] = [];
  const files: { name: string; id: string }[] = [];

  try {
    folders1.forEach(fold => {
      const folderPath = `${ruta}\\${fold.name}`;
      if (!fs.existsSync(folderPath)) {
        folders.push({name: fold.name, id: fold.id});
      }
    });

    files1.forEach(fil => {
      const filePath = `${ruta}\\${fil.name}`;
      if (!fs.existsSync(filePath)) {
        files.push({name: fil.name, id: fil.id});
      }
    });

  } catch (error) {
    console.error("Error al verificar contenido:", error);
  }

  return { 
    folders,
    files,
  };
}



