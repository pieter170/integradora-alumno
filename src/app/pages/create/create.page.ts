import { Component } from '@angular/core';
import { ApiService } from '../../services/api.service';
import { Router } from '@angular/router';
import { AlertController, LoadingController } from '@ionic/angular';

@Component({
  selector: 'app-create',
  templateUrl: './create.page.html',
  styleUrls: ['./create.page.scss'],
  standalone: false
})
export class CreatePage {

  userData = {
    username: '',
    email: '',
    password: ''
  };

  imagenPreview: string | ArrayBuffer | null = null;
  archivoSeleccionado: File | null = null;

  constructor(
    private apiService: ApiService,
    private router: Router,
    private alertCtrl: AlertController,
    private loadingCtrl: LoadingController
  ) { }

  seleccionarImagen() {
    document.getElementById('avatarInput')?.click();
  }

  procesarImagen(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.archivoSeleccionado = file;
      const reader = new FileReader();
      reader.onload = () => {
        this.imagenPreview = reader.result;
      };
      reader.readAsDataURL(file);
    }
  }

  // ----------------------------------------------------
  // 2. PROCESO DE REGISTRO (CORREGIDO)
  // ----------------------------------------------------

  async registrarUsuario() {
    if (!this.userData.username || !this.userData.email || !this.userData.password) {
      this.mostrarAlerta('Faltan datos', 'Por favor completa todos los campos.');
      return;
    }

    if (this.userData.password.length < 6) {
      this.mostrarAlerta('Contraseña débil', 'La contraseña debe tener al menos 6 caracteres.');
      return;
    }

    const loading = await this.loadingCtrl.create({ message: 'Registrando usuario...' });
    await loading.present();

    try {
      // 1. REGISTRO
      const registerRes = await this.apiService.registerUser(this.userData);
      const { jwt, user } = registerRes.data;

      // Guardamos en storage (por si acaso recarga la página)
      localStorage.setItem('token', jwt);
      localStorage.setItem('user', JSON.stringify(user));

      console.log('Usuario registrado:', user.username);

      // 2. SUBIR FOTO (Si seleccionó una)
      if (this.archivoSeleccionado) {
        loading.message = 'Subiendo tu foto...';

        const formData = new FormData();
        formData.append('files', this.archivoSeleccionado);

        // <--- CAMBIO IMPORTANTE: Pasamos 'jwt' como segundo parámetro
        // Esto asegura que Axios use este token AHORA MISMO, sin esperar al localStorage
        const uploadRes = await this.apiService.uploadImage(formData, jwt);

        if (uploadRes.data && uploadRes.data[0]) {
          const imagenId = uploadRes.data[0].id;
          
          // 3. VINCULAR FOTO AL USUARIO
          // <--- CAMBIO IMPORTANTE: También pasamos 'jwt' aquí
          // Asegúrate que en Strapi tu campo en Users se llame exactamente 'imagen'
          await this.apiService.updateUser(user.id, { imagen: imagenId }, jwt);

          user.imagen = uploadRes.data[0];
          localStorage.setItem('user', JSON.stringify(user));
        }
      }

      loading.dismiss();
      await this.mostrarAlerta('¡Cuenta Creada!', `Bienvenido, ${user.username}`);
      
      this.limpiarFormulario();
      this.router.navigate(['/home']);

    } catch (error: any) {
      loading.dismiss();
      console.error('Error en registro:', error);

      let mensaje = 'Ocurrió un error inesperado.';
      if (error.response?.data?.error?.message) {
        mensaje = error.response.data.error.message;
        if (mensaje.includes('taken')) {
          mensaje = 'El usuario o correo ya existen.';
        }
      }
      this.mostrarAlerta('Error al registrar', mensaje);
    }
  }

  limpiarFormulario() {
    this.userData = { username: '', email: '', password: '' };
    this.imagenPreview = null;
    this.archivoSeleccionado = null;
  }

  async mostrarAlerta(header: string, message: string) {
    const alert = await this.alertCtrl.create({
      header,
      message,
      buttons: ['OK']
    });
    await alert.present();
  }
}