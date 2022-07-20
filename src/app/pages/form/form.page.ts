import { Component, OnInit } from '@angular/core';
import { NavController, AlertController, LoadingController, MenuController, ToastController } from '@ionic/angular';
// import { DisclaimerPage } from '../disclaimer/disclaimer';
// import { HomePage } from '../home/home';
// import { BlockedPage } from '../blocked/blocked';
import { ApiService } from '../../services/api.service';
import { EventsService } from '../../services/events.service';

// import { Geolocation } from '@ionic-native/geolocation/ngx';

declare var apiRTC: any;

@Component({
  selector: 'app-form',
  templateUrl: './form.page.html',
  styleUrls: ['./form.page.scss'],
})
export class FormPage implements OnInit {

  ngOnInit() {
  }

  sin_number:any;
  sin_number_confirmation:any;

  imClient:any;
  map:any;

  new = false;

  sin_number_create:any;
  sin_number_repeat:any;
  name:any;

  constructor(
	public navCtrl: NavController, 
  	public alertCtrl: AlertController, 
  	public api: ApiService, 
  	public loading: LoadingController, 
  	public events: EventsService, 
  	// public geolocation: Geolocation, 
  	public menu: MenuController,
    public toast: ToastController
  	) {

    this.events.destroy('new');
    this.events.subscribe('new',()=>{
      this.new = true;
      console.log(this.new);
    })

    this.receiveIMMessageHandler = this.receiveIMMessageHandler.bind(this);
    this.sessionReadyHandler = this.sessionReadyHandler.bind(this);
  }

  sessionReadyHandler()
  {
    this.imClient = apiRTC.session.createIMClient();

    apiRTC.addEventListener("receiveIMMessage", this.receiveIMMessageHandler);
  }

  receiveIMMessageHandler(e) {
    console.log(e);
    if (e.detail.message == "RECARGAR_LISTA_DE_SINIESTROS") {
      this.events.publish('RELOAD:SINISTER');
    }

    if (e.detail.message == "STREET_OPERATOR_NOW_INACTIVE") {
      let load = this.loading.create();
      load.then(l=>{
      	l.present();
	      apiRTC.disconnect();
	      this.navCtrl.navigateRoot('blocked');
	      l.dismiss();
      })
    }
  }

  cancelNew()
  {
    this.new = false;
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad FormPage');

    // let watchOptions = {
    //     // timeout : 60*60*1000,
    //     maxAge: 0,
    //     enableHighAccuracy: true
    // };

    // let watch = this.geolocation.watchPosition(watchOptions);
    // watch.subscribe((data) => {

    //   console.log("watch")

    //   if (data.coords) {
    //     localStorage.setItem('lat',data.coords.latitude.toString());
    //     localStorage.setItem('lng',data.coords.longitude.toString());
    //   }else{
    //     console.log('disconnected')
    //   }
    //  // data can be a set of coordinates, or an error (if an error occurred).
    //  // data.coords.latitude
    //  // data.coords.longitude
    // });
    
    apiRTC.init({
      // apiKey: "819abef1fde1c833e0601ec6dd4a8226",
      apiKey: "c67e026888d764c51462554b272f3419",
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
          this.api.techDeviceId("0")
          .subscribe(
            data => {console.log('ok');
              localStorage.clear();
              this.navCtrl.navigateRoot('disclaimer');
            },
            err => {console.log(err);}
          );
  			}
  		},{
  			text: "No",
  			role: "cancel"
  		}]
  	})

  	alert.then(a=>{a.present()});
  }

  check()
  {
    this.events.publish('openSinister',this.sin_number);
    // let loading = this.loading.create();
    // loading.present();
    // this.api.check(this.sin_number, this.sin_number_confirmation).map(res=>res.json())
    // .subscribe(data=>{
    //   loading.dismiss();
    //   this.sin_number = null;
    //   this.sin_number_confirmation = null;
    //   this.events.publish('getClaims');
    //   this.navCtrl.push(HomePage,{data:data})
    // },err=>{
    //   loading.dismiss();
    //   var arr = Object.keys(JSON.parse(err._body)).map(function(k) { return JSON.parse(err._body)[k] });
    //   let alert = this.alertCtrl.create({message: arr[0][0]});
    //   alert.addButton({
    //     text: "Ok"
    //   })
    //   alert.present();
    // });
  }

  openMenu()
  {
  	this.menu.open();
  }

  create()
  {
    this.loading.create().then(l=>{
      l.present();
      this.api.autoassign({

        sin_number:this.sin_number_create,
        sin_number_confirmation:this.sin_number_repeat,
        name:this.name,
        id: JSON.parse(localStorage.getItem('techUser'))['id']

      }).subscribe(data=>{
        l.dismiss();

        this.alertCtrl.create({message:"Sinistro creato"}).then(a=>a.present());
        this.new = false;

        this.events.publish('RELOAD:SINISTER',true);


      },err=>{

        var arr = Object.keys(err.error).map(function(k) { return err.error[k] });
        this.toast.create({message:arr[0][0], duration: 3000}).then(t=>t.present());
        l.dismiss();
      })
    })
  }

  cancel()
  {
    if (this.sin_number_create || this.name) {
      this.alertCtrl.create({message:"Sei sicuro di annullare l'operazione?", buttons: [{
        text:"Si",
        handler:()=>{
          this.new = false;
        }
      },{
        text:"No"
      }]}).then(a=>a.present());
    }else{
      this.new = false;
    }
  }


}
