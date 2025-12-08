import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { AlertController, LoadingController } from '@ionic/angular';

@Component({
  selector: 'app-perfil',
  templateUrl: './perfil.page.html',
  styleUrls: ['./perfil.page.scss'],
  standalone: false
})
export class PerfilPage {

  user: any = {};
  editMode = false;
  imagenPreview: string = '';

  constructor(
    private router: Router,
    private apiService: ApiService,
    private alertCtrl: AlertController,
    private loadingCtrl: LoadingController
  ) { }

  ionViewWillEnter() {
    this.cargarUsuario();
  }

  async cargarUsuario() {
    const storedUser = localStorage.getItem('user');
    
    if (storedUser) {
      // 1. Carga inicial rápida desde memoria
      this.user = JSON.parse(storedUser);
      
      // 2. REFRESCAR DESDE EL SERVIDOR (AXIOS)
      // Esto asegura traer la imagen si se acaba de subir
      try {
        const response = await this.apiService.getUsuario(this.user.id);
        const serverUser = response.data; // En Axios los datos están en .data
        
        console.log('Usuario fresco desde Strapi:', serverUser);

        // Actualizamos la vista y el localStorage
        this.user = serverUser;
        localStorage.setItem('user', JSON.stringify(serverUser));

        // Procesamos la imagen
        if (this.user.imagen) {
          this.imagenPreview = this.getImagenUrl(this.user.imagen);
        }

      } catch (error) {
        console.error('No se pudo refrescar el usuario', error);
      }

    } else {
      this.router.navigate(['/login']);
    }
  }

  // Tu función auxiliar para las URLs
  getImagenUrl(imgData: any): string {
    if (!imgData) return '';
    let url = '';

    if (imgData.url) {
      url = imgData.url;
    } else if (imgData.data && imgData.data.attributes) {
      url = imgData.data.attributes.url;
    } else if (Array.isArray(imgData) && imgData[0]) {
      url = imgData[0].url;
    }

    if (url) {
      return url.startsWith('http') ? url : 'http://localhost:1337' + url;
    }
    return '';
  }

  toggleEdit() {
    this.editMode = !this.editMode;
    if (!this.editMode) this.cargarUsuario();
  }

  async guardarCambios() {
    const loading = await this.loadingCtrl.create({ message: 'Guardando...' });
    await loading.present();

    try {
      const dataToSend = {
        username: this.user.username,
        email: this.user.email
      };

      // Axios Update
      const response = await this.apiService.updateUser(this.user.id, dataToSend);
      
      // Axios devuelve la respuesta en response.data
      localStorage.setItem('user', JSON.stringify(response.data));
      
      this.editMode = false;
      this.cargarUsuario(); // Recargamos para ver cambios
      
      loading.dismiss();
      this.mostrarAlerta('Éxito', 'Perfil actualizado.');

    } catch (error) {
      console.error(error);
      loading.dismiss();
      this.mostrarAlerta('Error', 'No se pudo actualizar.');
    }
  }

  logout() {
    localStorage.clear();
    this.router.navigate(['/login']);
  }

  async mostrarAlerta(header: string, message: string) {
    const alert = await this.alertCtrl.create({ header, message, buttons: ['OK'] });
    await alert.present();
  }
}