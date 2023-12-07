// my-gateway.gateway.ts
import { MessageBody, SubscribeMessage, WebSocketGateway, WebSocketServer} from "@nestjs/websockets";
import { Server } from "socket.io";
import { accessToken} from './config';
import { Socket } from "socket.io";
import { getOneDriveFolders, downloadFile,  getFolderContent, downloadFolder} from "./funciones";
import { url } from "inspector";
import { getOneDriveFolders_c, downloadFile_c,  getFolderContent_c, downloadFolder_c } from "./funciones-comp";

@WebSocketGateway()
export class MyGateway {
  
    @WebSocketServer() 
    server: Server;
    
    @SubscribeMessage('haConnection')
    async haConnection( @MessageBody() data: any) { 
      this.server.emit('mostrarLoader'); 
      const contenido = await getOneDriveFolders(accessToken, data);
      this.server.emit('carpetas',{contenido: contenido, foldername: 'One_Drive'});
      this.server.emit('ocultarLoader');
    } 

   
    @SubscribeMessage('mostrarContenidoCarpeta') 
    async handleContenido(@MessageBody() data: any){
      this.server.emit('mostrarLoader');
      try{
        const folderId = data.id;
        const name = data.name;
        const fold = data.fold;
        const contenido = await  getFolderContent(accessToken, folderId);
        const rutalk = {name : name, id: folderId, fold: fold};
        this.server.emit('carpetas',{contenido: contenido, foldername: `${fold}\\${name}`});
        this.server.emit('actualizarRuta', rutalk);
        this.server.emit('ocultarLoader');
      }
     catch (error){
      console.log(error);
    }
  }

  @SubscribeMessage('descargarFile') 
  async handleDescarga(@MessageBody() data: any) {
    this.server.emit('mostrarLoader'); 
    try {
        const fileId = data.id;
        const fileName = data.name;
        const folderName = data.fold;
        const rutaDescarga = `C:\\Users\\crist\\OneDrive\\Escritorio\\descargaOneDrive\\${folderName}`;
        const alertaExt = await downloadFile(accessToken, fileId, rutaDescarga);
        console.log(alertaExt);
        this.server.emit('descargaCompletada', `El archivo ${fileName} se ha descargado correctamente`);
        this.server.emit('ocultarLoader');
    } catch (error) {
        this.server.emit('descargaNoCompletada', 'La descarga no se ha podido completar');
        console.log(error);
    }
  }

    @SubscribeMessage('descargarFolder') 
  async handleDescargaFold(@MessageBody() data: any) {
    this.server.emit('mostrarLoader'); 
    try {
      const folderId = data.id;
      const folderName = data.name;
      const fold = data.fold;
      const rutaDescarga = `C:\\Users\\crist\\OneDrive\\Escritorio\\descargaOneDrive\\${fold}`;
      let existe = false;
      existe = await downloadFolder(folderId, folderName, rutaDescarga, accessToken, existe);
      if(existe){
        this.server.emit('descargaCompletada', `la carpeta ${folderName} se ha descargado correctamente`);
      }else{
        this.server.emit('descargaCompletada', `la carpeta ${folderName} ya existe en el dispositivo`);
      }      
      this.server.emit('ocultarLoader');
    } catch (error) {
      this.server.emit('descargaNoCompletada', 'La descarga no se ha podido completar');
      console.log(error);
    }
  }

    /** ####################### Carpetas Compartidas #################################### */
    @SubscribeMessage('haConnectionC')
    async haConnectionC( @MessageBody() data: any) { 
      this.server.emit('mostrarLoader'); 
      const contenido = await getOneDriveFolders_c(accessToken, data);
      this.server.emit('carpetas',{contenido: contenido, foldername: 'Carpetas_Compartidas'});
      this.server.emit('ocultarLoader');
    } 

    @SubscribeMessage('descargarFileC') 
    async handleDescarga_c(@MessageBody() data: any) {
      this.server.emit('mostrarLoader'); 
      try {
          const fileId = data.id;
          const fileName = data.name;
          const folderName = data.fold;
          const driveId = data.driveId;
          console.log(driveId);
          const rutaDescarga = `C:\\Users\\crist\\OneDrive\\Escritorio\\descargaOneDrive\\${folderName}`;
          await downloadFile_c(accessToken, fileId, driveId, rutaDescarga);
          this.server.emit('descargaCompletada', `El archivo ${fileName} se ha descargado correctamente`);
          this.server.emit('ocultarLoader');
      } catch (error) {
          this.server.emit('descargaNoCompletada', 'La descarga no se ha podido completar');
          console.log(error);
      }
    }

    @SubscribeMessage('descargarFolderC') 
    async handleDescargaFold_c(@MessageBody() data: any) {
      this.server.emit('mostrarLoader'); 
      try {
        const folderId = data.id;
        const folderName = data.name;
        const fold = data.fold;
        const driveId = data.driveId;
        const rutaDescarga = `C:\\Users\\crist\\OneDrive\\Escritorio\\descargaOneDrive\\${fold}`;
        let existe = false;
        existe = await downloadFolder_c(folderId, driveId, folderName, rutaDescarga, accessToken, existe);
        if(existe){
          this.server.emit('descargaCompletada', `la carpeta ${folderName} se ha descargado correctamente`);
        }else{
          this.server.emit('descargaCompletada', `la carpeta ${folderName} ya existe en el dispositivo`);
        }
        this.server.emit('ocultarLoader');
      } catch (error) {
        this.server.emit('descargaNoCompletada', 'La descarga no se ha podido completar');
        console.log(error);
      }
    }


    @SubscribeMessage('mostrarContenidoCarpetaC') 
    async handleContenido_c(@MessageBody() data: any){
      this.server.emit('mostrarLoader');
      try{
        const folderId = data.id;
        const name = data.name;
        const fold = data.fold;
        const driveId = data.driveId;
        const contenido = await  getFolderContent_c(accessToken, folderId, driveId);
        const rutalk = {name : name, id: folderId, fold: fold};
        this.server.emit('carpetas',{contenido: contenido, foldername: `${fold}\\${name}`});
        this.server.emit('actualizarRuta', rutalk);
        this.server.emit('ocultarLoader');
      }
     catch (error){
      console.log(error);
    }
  }
    

}
