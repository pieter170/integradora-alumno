import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-menu',
  templateUrl: './menu.page.html',
  styleUrls: ['./menu.page.scss'],
  standalone: false,
})
export class MenuPage implements OnInit {

  constructor(private router:Router) { }

  ngOnInit() {
  }

     async logout(){
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this.router.navigateByUrl('/login')
  }

}
