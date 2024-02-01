import { accessToken } from './config';
import axios from 'axios';
import * as fs from 'fs';
import * as path from 'path';

//Obtener las carpetas OneDrive Principal
export async function getOneDriveFolders_c(accessToken:string, urlp: string): Promise<{ folders: any[]; files: any[] }> { 

    try {
      const response = await axios.get(
        urlp,
        {headers: { Authorization: `Bearer ${accessToken}`, },  },
      );

      const folders = response.data.value
          .filter((item: any) => item.folder)
          .map((item: any) => ({
            name: item.name, 
            id: item.id,
            driveId: item.remoteItem.parentReference.driveId
          }));

        const files = response.data.value
          .filter((item: any) => item.file)
          .map((item: any) => ({
            
            name: item.name,
            id: item.id,
            driveId: item.remoteItem.parentReference.driveId
          }));
        return { folders, files };
        
    } catch (error) {
      this.server.emit("tockenInvalido", "El token de acceso ha caducado")
      throw new Error('Error al obtener las carpetas de OneDrive');
    }
}

//Descargar archivos
export async function downloadFile_c(accessToken: string, folderContenId: string, driveId:string,  rutaDescargas:string) {
    try {
      const response = await axios.get(
        `https://graph.microsoft.com/v1.0/drives/${driveId}/items/${folderContenId}/content`,
        {
          responseType: 'stream',
          headers: {
            Authorization: `Bearer ${accessToken}`, 
          },
        }, 
      );

      const response2 = await axios.get(
        `https://graph.microsoft.com/v1.0/drives/${driveId}/items/${folderContenId}`,
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
            console.log(downloadSize, fileSize)
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
      //##############################################################################
    if (alertaExt){
      return alertaExt
    }
    } catch (error) {
        this.server.emit('descargaNoCompletada', 'La descarga no se ha podido completar');
        console.log(error);
    }
}

//Acceder al contenido de las carpetas
export async function getFolderContent_c(accessToken: string, folderId: string, driveId:string): Promise<{folders: any[]; files: any[]}> {
    
    try {
      const response = await axios.get(
        `https://graph.microsoft.com/v1.0/drives/${driveId}/items/${folderId}/children`,
        {headers: { Authorization: `Bearer ${accessToken}`, }, },
      );
      const folders = response.data.value
        .filter((item: any) => item.folder)
        .map((item: any) => ({
          name: item.name,
          id: item.id,
          driveId: item.parentReference.driveId
        }));

      const files = response.data.value
        .filter((item: any) => item.file)
        .map((item: any) => ({
          name: item.name,
          id: item.id,
          driveId: item.parentReference.driveId
        }));
        

      return { folders, files };
      
    } catch (error) {
      this.server.emit('ocultarLoader')
      console.log(error);
      throw new Error('Error al obtener el contenido de la carpeta');
    }
  }

  let existe2;

export async function downloadFolder_c(folderId: string, driveId:string, nameFolder: string, rutaDescarga: string, accessToken: string) {
  try {
    
    const constResponse = await axios.get(
      `https://graph.microsoft.com/v1.0/drives/${driveId}/items/${folderId}/children`,
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
        await downloadFolder_c(item.id, item.parentReference.driveId, item.name, folderPath, accessToken);
      } else if (item.file) {
        await downloadFile_c(accessToken, item.id, item.parentReference.driveId, folderPath);
      }
    });

    await Promise.all(promises);
  } catch (error) {
    console.error('Error al descargar la carpeta', error.message);
    throw new Error('Error al descargar la carpeta');
  }
}



