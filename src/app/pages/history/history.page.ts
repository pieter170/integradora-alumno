import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-history',
  templateUrl: './history.page.html',
  styleUrls: ['./history.page.scss'],
  standalone: false
})
export class HistoryPage implements OnInit {

  // Aquí guardaremos la lista que mostraste en tu log
  historial: any[] = [];
  cargando: boolean = true;

  constructor(private apiService: ApiService) { }

  ngOnInit() {
    this.cargarHistorial();
  }

  async cargarHistorial() {
    try {
      const respuesta = await this.apiService.getHistorial();
      
      // Strapi devuelve la data dentro de "data".
      // Dependiendo de cómo guardaste el pedido, la estructura puede variar.
      // Si guardaste directamente el array de productos como un JSON, se verá así:
      this.historial = respuesta.data.data; 
      
      // DEBUG: Para ver si llega lo mismo que tu log
      console.log('Historial recibido:', this.historial);
      
    } catch (error) {
      console.error('Error cargando historial', error);
    } finally {
      this.cargando = false;
    }
  }
}