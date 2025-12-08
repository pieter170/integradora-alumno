import { Injectable } from '@angular/core';
import axios from 'axios';

@Injectable({
  providedIn: 'root',
})
export class ApiService {

  // Cambia localhost por tu IP si pruebas en celular físico
  private apiUrl = 'http://localhost:1337/api';

  // Variable del carrito
  private carrito: any[] = [];

  constructor() {
    // Recuperar el carrito del almacenamiento al iniciar el servicio
    const guardado = localStorage.getItem('carrito_compras');
    if (guardado) {
      this.carrito = JSON.parse(guardado);
    }
  }

  // ==========================================
  // AUTENTICACIÓN Y USUARIOS
  // ==========================================

  async registerUser(data: any) {
    return axios.post(`${this.apiUrl}/auth/local/register`, data);
  }

  async loginUser(identifier: string, password: string) {
    return axios.post(`${this.apiUrl}/auth/local`, {
      identifier,
      password
    });
  }

  async getUsuario(id: number) {
    const token = localStorage.getItem('token');
    return axios.get(`${this.apiUrl}/users/${id}?populate=*`, {
      headers: { Authorization: `Bearer ${token}` }
    });
  }

  async updateUser(userId: number, data: any, explicitToken?: string) {
    const token = explicitToken || localStorage.getItem('token');
    return axios.put(`${this.apiUrl}/users/${userId}`, data, {
      headers: { Authorization: `Bearer ${token}` }
    });
  }

  // ==========================================
  // GESTIÓN DE IMÁGENES (Upload)
  // ==========================================

  async uploadImage(formData: FormData, explicitToken?: string) {
    const token = explicitToken || localStorage.getItem('token');
    return axios.post(`${this.apiUrl}/upload`, formData, {
      headers: { Authorization: `Bearer ${token}` }
    });
  }

  // ==========================================
  // PRODUCTOS
  // ==========================================

  async getProductos() {
    return axios.get(`${this.apiUrl}/productos?populate=*`);
  }

  // ==========================================
  // FUNCIONES DEL CARRITO
  // ==========================================

  getCarrito() {
    return this.carrito;
  }

  agregarAlCarrito(producto: any) {
    const itemExistente = this.carrito.find(p => p.id === producto.id);
    if (itemExistente) {
      itemExistente.cantidad += 1;
    } else {
      this.carrito.push({ ...producto, cantidad: 1 });
    }
    this.guardarEnStorage();
  }

  eliminarDelCarrito(producto: any) {
    const index = this.carrito.findIndex(p => p.id === producto.id);
    if (index > -1) {
      const item = this.carrito[index];
      item.cantidad--;
      if (item.cantidad === 0) {
        this.carrito.splice(index, 1);
      }
    }
    this.guardarEnStorage();
  }

  limpiarCarrito() {
    this.carrito = [];
    localStorage.removeItem('carrito_compras');
  }

  obtenerTotal() {
    return this.carrito.reduce((total, item) => {
      const precio = Number(item.precio) || 0;
      return total + (precio * item.cantidad);
    }, 0);
  }

  private guardarEnStorage() {
    localStorage.setItem('carrito_compras', JSON.stringify(this.carrito));
  }

  // ==========================================
  // PEDIDOS E HISTORIAL (AQUÍ ESTABAN LOS ERRORES)
  // ==========================================

  async getHistorial() {
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user') || '{}');

    // CORRECCIÓN: Usamos 'users_permissions_user' porque así se llama en tu Strapi
    return axios.get(`${this.apiUrl}/pedidos?filters[users_permissions_user][id][$eq]=${user.id}&populate=*`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
  }

  async enviarPedido(items: any[]) {
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');
    const user = userStr ? JSON.parse(userStr) : null;

    if (!user || !user.id || !token) {
      throw new Error('Usuario no autenticado');
    }

    const total = items.reduce((acc, item) => acc + (Number(item.precio) * item.cantidad), 0);

    const payload = {
      data: {
        productos: items, 
        total: total,
        fecha: new Date().toISOString(),
        // CORRECCIÓN: Cambiado de 'user' a 'users_permissions_user'
        users_permissions_user: user.id 
      }
    };

    return axios.post(`${this.apiUrl}/pedidos`, payload, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
  }
}