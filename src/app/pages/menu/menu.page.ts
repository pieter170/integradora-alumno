import { Component } from '@angular/core';
import { ApiService } from '../../services/api.service';
import { Router } from '@angular/router';
import { LoadingController, ToastController } from '@ionic/angular';

@Component({
  selector: 'app-menu',
  templateUrl: './menu.page.html',
  styleUrls: ['./menu.page.scss'],
  standalone: false,
})
export class MenuPage {

  productos: any[] = [];
  productosVisibles: any[] = [];
  categoriaSeleccionada = 'todos';
  
  // URL base de Strapi
  // IMPORTANTE: Si pruebas en celular, usa tu IP (ej. http://192.168.1.50:1337)
  private baseUrl = 'http://localhost:1337'; 

  constructor(
    private apiService: ApiService,
    private router: Router,
    private loadingCtrl: LoadingController,
    private toastCtrl: ToastController 
  ) { }

  ionViewWillEnter() {
    this.cargarDatos();
  }

  async cargarDatos() {
    const loading = await this.loadingCtrl.create({ message: 'Cargando menú...' });
    await loading.present();

    try {
      const response = await this.apiService.getProductos();
      // Ajuste para leer los datos correctamente
      this.productos = response.data.data || response.data; 
      this.productosVisibles = this.productos;

      loading.dismiss();
    } catch (error) {
      console.error(error);
      loading.dismiss();
    }
  }

  // --- FUNCIÓN PARA EXTRAER LA FOTO ---
  getImagenUrl(producto: any): string {
    // 1. Si no hay campo imagen, retornamos una imagen local (para que no de error de red)
    if (!producto.imagen) {
      return 'assets/icon/favicon.png'; 
    }

    let url = '';

    // Caso A: Estructura anidada estándar de Strapi v4
    if (producto.imagen.data && producto.imagen.data.attributes) {
      url = producto.imagen.data.attributes.url;
    } 
    // Caso B: Estructura simplificada
    else if (producto.imagen.url) {
      url = producto.imagen.url;
    }
    // Caso C: Array de imágenes
    else if (Array.isArray(producto.imagen) && producto.imagen.length > 0) {
       // Verificamos si viene plano o con attributes dentro del array
       url = producto.imagen[0].url || producto.imagen[0].attributes?.url;
    }

    // 3. Si encontramos URL, le pegamos el dominio del servidor
    if (url) {
      return this.baseUrl + url;
    }

    // Si falló todo, retornamos la imagen local por defecto
    return 'assets/icon/favicon.png';
  }

  filtrarPor(categoria: string) {
    this.categoriaSeleccionada = categoria;
    if (categoria === 'todos') {
      this.productosVisibles = this.productos;
    } else {
      this.productosVisibles = this.productos.filter(p => 
        p.categoria && p.categoria.toLowerCase() === categoria.toLowerCase()
      );
    }
  }
  // --- FUNCIÓN ACTUALIZADA ---
  async agregarAlCarrito(producto: any) {
    this.apiService.agregarAlCarrito(producto);
    
    // Mostrar mensaje visual
    const toast = await this.toastCtrl.create({
      message: `Agregaste ${producto.nombre} al pedido`,
      duration: 1500,
      position: 'bottom',
      color: 'success'
    });
    toast.present();
  }

  // ... resto del código


  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this.router.navigate(['/login']);
  }
}