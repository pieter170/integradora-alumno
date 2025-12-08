import { CanActivateFn, Router } from '@angular/router'; // Importamos Router
import { inject } from '@angular/core'; // Necesario para inyectar Router en una función
import axios from 'axios';
import { environment } from 'src/environments/environment';

export const authGuard: CanActivateFn = async (route, state) => {
  
  const router = inject(Router);

  const url = environment.apiUrl || 'http://localhost:1337/api'; 
  
  const token = localStorage.getItem('token');


  if (!token) {
    router.navigate(['/login']);
    return false;
  }

  try {
   
    const response = await axios.get(url + '/users/me?populate=*', {
      headers: {
        'Authorization': 'Bearer ' + token
      }
    });

    
    //(OPCIONAL) Si quieres bloquear usuarios bloqueados por Strapi
    if (response.data.blocked === true) {
      alert("Tu cuenta ha sido bloqueada.");
      localStorage.clear();
      router.navigate(['/login']);
      return false;
    }

    console.log('Usuario autorizado:', response.data.username);
    return true;

  } catch (error) {
    console.error('Error de autenticación:', error);
    
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    
    
    router.navigate(['/login']);
    return false;
  }
};


// import { CanActivateFn } from '@angular/router';

// import axios, { Axios } from 'axios';
// import { environment } from 'src/environments/environment.prod';

// export const authGuard: CanActivateFn = async(route, state) => {
//   let url=environment.apiUrl
//   const token = localStorage.getItem('token');
//   if (!token) {
//     window.alert('Debes iniciar sesion para continuar');
//     window.location.href = '/login';
    
//     return false;
//   }else{
//     try{
//       const user= await axios.get(url+'/users/me?populate=*',{
//         headers:{
//           'Authorization': 'Bearer ' + token
//         }
        
//       });
//       if(user.data.role.type!="Authenticated"){
//          localStorage.removeItem('token')
//       localStorage.removeItem('user')
//       window.alert("Tu sesion ha caducado, vuelve a iniciar sesion para volver a intentarlo");
//       window.location.href = '/login'
//       return false
        
//       }
//     console.log(user)
//     return true
//     }catch(error) {
//       localStorage.removeItem('token')
//       localStorage.removeItem('user')
//       console.log(error)
//       window.alert("Tu sesion ha caducado, vuelve a iniciar sesion para volver a intentarlo");
//       window.location.href = '/login'
//       return false

//     }
//   }


//   window.location.href = '/login'
//   return true;

//};
