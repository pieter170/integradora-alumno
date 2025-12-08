import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../services/api.service';
import { AlertController } from '@ionic/angular'; // 1. Importar AlertController

@Component({
  selector: 'app-pedido',
  templateUrl: './pedido.page.html',
  styleUrls: ['./pedido.page.scss'],
  standalone: false
})
export class PedidoPage implements OnInit {

  itemsCarrito: any[] = [];
  total: number = 0;

  constructor(
    private apiService: ApiService,
    private alertCtrl: AlertController // 2. Inyectarlo en el constructor
  ) { }

  ngOnInit() {
    this.cargarCarrito();
  }

  ionViewWillEnter() {
    this.cargarCarrito();
  }

  cargarCarrito() {
    this.itemsCarrito = this.apiService.getCarrito();
    this.total = this.apiService.obtenerTotal();
  }

  // ... tus funciones de sumar y restar ...

  // ==========================================
  // ESTA ES LA FUNCIÓN A MODIFICAR
  // ==========================================
  async confirmarPedido() {
    // Opcional: Validar que haya cosas en el carrito
    if (this.itemsCarrito.length === 0) return;

    try {
      // 1. Llamar a tu servicio para guardar el pedido en Strapi
      // (Asegúrate de tener este método creado en tu api.service.ts)
      await this.apiService.enviarPedido(this.itemsCarrito); // O como se llame tu función

      // 2. Limpiar el carrito una vez enviado
      this.apiService.limpiarCarrito();
      this.itemsCarrito = [];
      this.total = 0;

      // 3. Mostrar la alerta de éxito
      const alert = await this.alertCtrl.create({
        header: '¡Pedido Enviado!',
        subHeader: 'Gracias por tu compra',
        message: 'Tu pedido ha sido registrado correctamente.',
        buttons: ['OK'] // Al dar clic, simplemente se cierra la alerta
      });

      await alert.present();

      // 4. IMPORTANTE: NO navegamos a ningún lado.
      // Eliminamos o comentamos la línea: this.router.navigate(['/menu']);
      
      // Al vaciarse el array 'itemsCarrito', tu HTML automáticamente 
      // mostrará el div de "No has agregado nada aún".

    } catch (error) {
      console.error(error);
      const alertError = await this.alertCtrl.create({
        header: 'Error',
        message: 'Hubo un problema al enviar tu pedido. Inténtalo de nuevo.',
        buttons: ['OK']
      });
      await alertError.present();
    }
  }

  // ... Resto de funciones (sumar, restar) ...
  sumar(item: any) {
    this.apiService.agregarAlCarrito(item);
    this.cargarCarrito();
  }

  restar(item: any) {
    this.apiService.eliminarDelCarrito(item);
    this.cargarCarrito();
  }
}