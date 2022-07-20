import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { File } from '@ionic-native/file/ngx';
// import 'rxjs/add/operator/map';

/*
  Generated class for the ApiProvider provider.

  See https://angular.io/docs/ts/latest/guide/dependency-injection.html
  for more info on providers and Angular 2 DI.
*/
@Injectable({
	providedIn: 'root'
})
export class ApiService {

  url = "https://app.expressclaims.it";
  // url = "https://webgest.gespea.it";

  constructor(public http: HttpClient, public file: File) {
  }

  login(email, password){
    let user = this.http.post(this.url+'/api/authentication',{email:email, password: password});
    return user;
  }

  check(sin, sin_c){
    let id = JSON.parse(localStorage.getItem('techUser'))['id'];
    let sinister = this.http.post(this.url+'/api/check',{sin_number:sin, sin_number_confirmation: sin_c, id: id});
    return sinister;
  }

  getClaims(){
    let id = JSON.parse(localStorage.getItem('techUser'))['id'];
    let claims = this.http.post(this.url+'/api/getClaims',{id: id});
    return claims;
  }

  getClaimMedia(sin){
    let claims = this.http.post(this.url+'/api/getClaimMedia',{sin_number: sin});
    return claims;
  }

  deleteFile(id){
    let file = this.http.post(this.url+'/api/deleteFile',{id: id});
    return file; 
  }

  sendSMS(message, number){
    let resp = this.http.post(this.url+'/api/sendSMS',{number: number, message: message, name: "E Tech"});
    return resp;
  }

  registration(data){
    let resp = this.http.post(this.url+'/api/registrationStreet',data);
    return resp;
  }

  loadInformation(sin_number){
    let resp = this.http.get(this.url+'/api/loadInformation/'+sin_number);
    return resp;
  }

  uploadInformation(data){
    let resp = this.http.post(this.url+'/api/uploadInformation',data);
    return resp;
  }

  closeSin(sin_number){
   let resp = this.http.post(this.url+'/api/closeSin',{sin_number:sin_number});
    return resp; 
  }

  notFinished(sin_number,t){
   let resp = this.http.post(this.url+'/api/notFinished',{sin_number:sin_number,viaggio:t});
    return resp; 
  }

  closeSelected(data){
   let resp = this.http.post(this.url+'/api/closeSelected',{data:data});
   return resp; 
  }

  getOperator(id){
   let resp = this.http.get(this.url+'/api/getOperator/'+id);
   return resp;
  }

  techDeviceId(device_id){
   let id = JSON.parse(localStorage.getItem('techUser'))['id'];
   let resp = this.http.get(this.url+'/api/techDeviceId/'+device_id+'/'+id);
   return resp;
  }

  /**/

  createSubproduct(sin_number,name){
    let resp = this.http.post(this.url+'/api/createSubproduct',{sin_number:sin_number,name:name});
    return resp;
  }

  getClaim(claim_id)
  {
    let data = this.http.get(this.url+'/api/getClaim/'+claim_id,);
    return data; 
  }
  deleteSub(claim_id)
  {
    console.log('deleteSub',claim_id)
    let data = this.http.get(this.url+'/api/deleteSub/'+claim_id,);
    return data; 
  }

  /**/

  saveOfflineClaims(data)
  {
    return this.http.post(this.url+'/api/saveOfflineClaims',data);
  }

  /**/

  autoassign(data)
  {
    return this.http.post(this.url+'/api/autoassign',data);
  }

  /**/

  getTypologies()
  {
    return this.http.get(this.url+'/api/getTypologies');
  }

  getSections(id)
  {
    return this.http.get(this.url+'/api/getSections/'+id);
  }

}
