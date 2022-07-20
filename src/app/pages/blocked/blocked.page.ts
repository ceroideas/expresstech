import { Component, OnInit } from '@angular/core';
import { NavController, LoadingController, AlertController } from '@ionic/angular';
// import { DisclaimerPage } from '../disclaimer/disclaimer';
// import { FormPage } from '../form/form';
import { ApiService } from '../../services/api.service';
import { EventsService } from '../../services/events.service';

declare var apiRTC: any

@Component({
  selector: 'app-blocked',
  templateUrl: './blocked.page.html',
  styleUrls: ['./blocked.page.scss'],
})
export class BlockedPage implements OnInit {

  imClient;

  constructor(public navCtrl: NavController, public api: ApiService, public events: EventsService, public loadingCtrl: LoadingController, public alertCtrl: AlertController) { }

  ngOnInit() {
  }

  sessionReadyHandler()
  {
    this.imClient = apiRTC.session.createIMClient();
    console.log(this.imClient)

    apiRTC.addEventListener("receiveIMMessage", this.receiveIMMessageHandler);
  }

  receiveIMMessageHandler(e) {
    if (e.detail.message == "STREET_OPERATOR_NOW_ACTIVE") {
      let load = this.loadingCtrl.create();
      load.then(l=>{l.present()});
      apiRTC.disconnect();
      this.navCtrl.navigateRoot('form');
      this.loadingCtrl.dismiss();
    }
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad BlockedPage');

    apiRTC.init({
      apiKey: "819abef1fde1c833e0601ec6dd4a8226",
      apiCCId : JSON.parse(localStorage.getItem('techUser'))['id'],
      onReady: this.sessionReadyHandler
    });
  }

  logout()
  {
  	let alert = this.alertCtrl.create({
  		header: "Log Out?",
  		buttons: [{
  			text: "Si",
  			handler: () => {
  				localStorage.clear();
          apiRTC.disconnect();
          this.navCtrl.navigateRoot('disclaimer');
  			}
  		},{
  			text: "No",
  			role: "cancel"
  		}]
  	})

  	alert.then(a=>{a.present()});
  }

}
