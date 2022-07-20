import { Component, OnInit } from '@angular/core';
import { NavController, ToastController, LoadingController, MenuController } from '@ionic/angular';
import { ApiService } from '../../services/api.service';
import { EventsService } from '../../services/events.service';
// import { SMS } from '@ionic-native/sms';
// import { FormPage } from '../form/form';
import { AndroidPermissions } from '@ionic-native/android-permissions/ngx';

@Component({
  selector: 'app-registration',
  templateUrl: './registration.page.html',
  styleUrls: ['./registration.page.scss'],
  providers: [AndroidPermissions]
})
export class RegistrationPage implements OnInit {

  address;
  todo:any = {
    email:null,
    name:null,
    password:null,
    password_confirmation:null,
    phone:null
  };
  code = "39";
  verification;

  constructor(public navCtrl: NavController, public api: ApiService, public toast: ToastController, 
    private androidPermissions: AndroidPermissions, public events: EventsService,
    public loading: LoadingController, public menu: MenuController) {

    this.androidPermissions.requestPermission(this.androidPermissions.PERMISSION.SEND_SMS);

  	this.menu.swipeGesture(false);
    this.todo['address'] = localStorage.getItem('address');

    function makeid() {
      var text = "";
      var possible = "0123456789";

      for (var i = 0; i < 5; i++)
        text += possible.charAt(Math.floor(Math.random() * possible.length));

      return text;
    }

    localStorage.setItem('verification', makeid());

  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad RegistrationPage');
  }

  registration()
  {
  	let loading = this.loading.create({
  		message: "Sending Data"
  	});
    loading.then(l=>{
      l.present();

      if (this.verification != localStorage.getItem('verification')) {
        this.loading.dismiss();
        let toast = this.toast.create({message: "Il codice di verifica non corrisponde, riprova",duration: 3000});
        return toast.then(t=>{
            t.present();
          });
      }
    });

    this.todo['code'] = this.code;

  	this.api.registration(this.todo)
  	.subscribe(data=> {
  		let toast = this.toast.create({message: "Utente registrato correttamente, attende la conferma da un amministratore",duration: 3000});
  		this.loading.dismiss();
  		toast.then(t=>{
          t.present();
        });
      this.navCtrl.back();
  	},err=>{
      console.log(err.error);
  		var arr = Object.keys(err.error).map(function(k) { return err.error[k] });
  		this.loading.dismiss();
  		let toast = this.toast.create({message: arr[0][0],duration: 3000});
  		toast.then(t=>{
          t.present();
        });
  	})
  }

  sendSms(){
    let loading = this.loading.create({
      message: "Invio di SMS"
    });
    loading.then(l=>{
      l.present();
    });

    if (this.todo['phone'] != '' && this.todo['phone'] != null) {

      var message = 'Il tuo codice di verifica è: '+localStorage.getItem('verification');

      this.api.sendSMS(message, this.code+this.todo['phone'])
      .subscribe(data => {
        this.loading.dismiss();
        let toast = this.toast.create({message: "Il codice di verifica è stato inviato al tuo telefono", duration: 3000});
        toast.then(t=>{
          t.present();
        });
      }, err => {
        this.loading.dismiss();
        let toast = this.toast.create({message: "Error "+err.error, duration: 6000});
        toast.then(t=>{
          t.present();
        });
      })

    }else{
      let toast = this.toast.create({message: "Devi inserire un numero di telefono valido per inviare il codice di verifica", duration: 3000});
      this.loading.dismiss();
      toast.then(t=>{
          t.present();
        });
    }
  }

  ngOnInit() {
  }

}
