import { Component, OnInit } from '@angular/core';
import { NavController, ToastController, LoadingController, MenuController } from '@ionic/angular';
import { ApiService } from '../../services/api.service';
import { EventsService } from '../../services/events.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {

  email;
  password;

  constructor(public navCtrl: NavController, public events: EventsService, public api: ApiService, public toast: ToastController, public loading: LoadingController, public menu: MenuController) {
    this.menu.swipeGesture(false);
  }

  ngOnInit() {
  }

  login()
  {
    let loading = this.loading.create({
      message: "Sending Data"
    });

    loading.then(l=>{l.present()});

    this.api.login(this.email, this.password)
    .subscribe((data:any) => {
      localStorage.setItem('techUser',JSON.stringify(data));

      this.loading.dismiss();

      this.events.publish('getClaims');

      if (data.status == 1) {
        this.navCtrl.navigateRoot('form');
      }else{
        this.navCtrl.navigateRoot('blocked');
      }

      let onesignalId = localStorage.getItem('oneSignalIdTech');

      this.api.techDeviceId(onesignalId)
      .subscribe(
        data => {console.log('ok');},
        err => {console.log(err);}
      );

      this.events.publish('RELOAD:USER');

    },err=>{
      var arr = Object.keys(err.error).map(function(k) { return err.error[k] });
      // var arr = Object.keys(JSON.parse(err._body)).map(function(k) { return JSON.parse(err._body)[k] });
      this.loading.dismiss();
      let toast = this.toast.create({message: arr[0],duration: 3000});
      toast.then(t=>{t.present()});
    });
  }

  registration()
  {
    this.navCtrl.navigateForward('registration');
  }

}
