import { Component } from '@angular/core';
import { NavController, MenuController, Platform, LoadingController } from '@ionic/angular';
// import { LoginPage } from '../login/login';
// import { FormPage } from '../form/form';
// import { BlockedPage } from '../blocked/blocked';

import { Geolocation } from '@ionic-native/geolocation/ngx';
import { ApiService } from '../../services/api.service';

import { AndroidPermissions } from '@ionic-native/android-permissions/ngx';

declare var google;

/**
 * Generated class for the DisclaimerPage page.
 *
 * See http://ionicframework.com/docs/components/#navigation for more info
 * on Ionic pages and navigation.
 */
@Component({
  selector: 'app-disclaimer',
  templateUrl: './disclaimer.page.html',
  styleUrls: ['./disclaimer.page.scss'],
  providers: [Geolocation, AndroidPermissions, ApiService]
})
export class DisclaimerPage {

  checkQs = true;
  q1: boolean = true;
  q2: boolean = true;
  q3: boolean = true;
  imClient;
  clicked = "";
  loading;

  constructor(public platform: Platform, public navCtrl: NavController, public menu: MenuController,
    public loadingCtrl: LoadingController, public geolocation: Geolocation, private androidPermissions: AndroidPermissions, public api: ApiService) {
    // this.menu.swipeEnable(false);

    if (localStorage.getItem('clicked')) {
      this.clicked = "underline";
    }

    // this.getPosition();
  }

  setUnderline()
  {
    localStorage.setItem('clicked','1');
    this.clicked = "underline";
  }

  ionViewDidLoad() {
    setTimeout(()=>{
      if (this.platform.is('cordova')) {
        // this.localNotifications.hasPermission().then(()=>{
        //   console.log('Notification permission')
        // }).catch(()=>{
        //   this.localNotifications.requestPermission().then(()=>{
        //     console.log('Notification permission granted')
        //   }).catch(()=>{
        //     console.log('Notification permission denied')
        //   })
        // })
        this.androidPermissions.requestPermissions([
          this.androidPermissions.PERMISSION.ACCESS_COARSE_LOCATION,
          this.androidPermissions.PERMISSION.ACCESS_FINE_LOCATION,
          this.androidPermissions.PERMISSION.CAMERA,
          this.androidPermissions.PERMISSION.WRITE_EXTERNAL_STORAGE,
          this.androidPermissions.PERMISSION.READ_EXTERNAL_STORAGE,
          this.androidPermissions.PERMISSION.RECORD_AUDIO
        ]).then(()=>{
          this.getPosition();
        }).catch(err => {
          console.log(err);
        });
      }else{
        this.getPosition();
      }
    },1000)
  }

  goToLogin()
  {
    if(localStorage.getItem('techUser')){
      let user = JSON.parse(localStorage.getItem('techUser'));
      if (user['status'] == 1) {
        this.navCtrl.navigateRoot('form');
      }else{
        this.navCtrl.navigateRoot('blocked');
      }
    }else{
      this.navCtrl.navigateRoot('login');
    }
  }

  checkIfTrue()
  {
    if(this.q1 && this.q2){
      this.checkQs = true;
    }else{
      this.checkQs = false;
    }
  }

  getPosition()
  {
    this.loading = this.loadingCtrl.create({
      message: "Ottenere la posizione..."
    });
    this.loading.present();

    this.geolocation.getCurrentPosition({enableHighAccuracy: true,timeout: 10000,maximumAge: 0}).then((resp) => {
      
      localStorage.setItem('lat',resp.coords.latitude.toString());
      localStorage.setItem('lng',resp.coords.longitude.toString());

      var geo = new google.maps.Geocoder();

      geo.geocode({'latLng': {lat: resp.coords.latitude, lng: resp.coords.longitude}}, function(results,status) {
        localStorage.setItem('address',results[0]['formatted_address']);
      });

      if (!localStorage.getItem('techUser')) {
        this.api.getOperator(JSON.parse(localStorage.getItem('techUser'))['id'])
        .subscribe(data=>{
          localStorage.setItem('techUser',JSON.stringify(data));
          this.loading.dismiss();
        },()=>{
          this.loading.dismiss();
        })
      }else{
        this.loading.dismiss();
      }

    }).catch((error) => {
      this.loading.dismiss();
      console.log('Error getting location', error);
    });
  }

}
