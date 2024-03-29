// my-gateway.gateway.ts
import { MessageBody, SubscribeMessage, WebSocketGateway, WebSocketServer} from "@nestjs/websockets";
import { forwardRef, Inject} from "@nestjs/common";
import { Server } from "socket.io";
import { accessToken} from './config';
import { getOneDriveFolders, downloadFile,  getFolderContent, downloadFolder, verifyContent} from "./funciones";
import { getOneDriveFolders_c, downloadFile_c,  getFolderContent_c, downloadFolder_c } from "./funciones-comp";
import { UserController } from "src/app.controller";
import { UserService } from "src/app.service";

@WebSocketGateway()
export class MyGateway {
  constructor(@Inject(forwardRef(() => UserController)) private userController: UserController, private readonly userService: UserService) {}
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
    async handleContenido(@MessageBody() data: any) {
      this.server.emit('mostrarLoader');
    
      try {
        const { id: folderId, name, fold: fold} = data;
        const rutaDescarga = `C:\\Users\\crist\\OneDrive\\Escritorio\\descargaOneDrive\\${fold}\\${name}`;
        
        const contenido1 = await getFolderContent(accessToken, folderId);
        const rutalk = { name, id: folderId, fold };
        this.server.emit('carpetas', { contenido: contenido1, foldername: `${fold}\\${name}` });
        this.server.emit('actualizarRuta', rutalk);
        this.server.emit('ocultarLoader');
      } catch (error) {
        console.error(error);
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
      const check = data.check;
      const rutaDescarga = `C:\\Users\\crist\\OneDrive\\Escritorio\\descargaOneDrive\\${fold}`;
      const existingFolder = await this.userService.findFolderById(folderId);
      console.log(check, existingFolder);
      if (check && existingFolder){
        this.server.emit('descargaCompletada', `la carpeta ${folderName} ya existe`);
      }else{
        await downloadFolder(folderId, folderName, rutaDescarga, accessToken);
        this.server.emit('descargaCompletada', `la carpeta ${folderName} se ha descargado correctamente`);
      };
      //console.log(existingFolder);
      this.userController.saveFolder(folderId, folderName);    
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
        const check = data.check
        const rutaDescarga = `C:\\Users\\crist\\OneDrive\\Escritorio\\descargaOneDrive\\${fold}`; 
        const existingFolder = await this.userService.findFolderById(folderId);
        

        console.log(check, existingFolder);
        if (check && existingFolder){
          this.server.emit('descargaCompletada', `la carpeta ${folderName} ya existe`);
        }else{
          await downloadFolder_c(folderId, driveId, folderName, rutaDescarga, accessToken);
          this.server.emit('descargaCompletada', `la carpeta ${folderName} se ha descargado correctamente`);
        };
        this.userController.saveFolder(folderId, folderName); 

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
