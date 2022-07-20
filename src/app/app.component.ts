import { Component, OnInit, ViewChild, ChangeDetectorRef } from '@angular/core';
import { EventsService } from './services/events.service';
import { Platform, LoadingController, AlertController, NavController, MenuController } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import { Subscription } from 'rxjs';

import { Network } from '@ionic-native/network/ngx';
import { FileTransfer, FileUploadOptions, FileTransferObject } from '@ionic-native/file-transfer/ngx';
import { OneSignal } from '@ionic-native/onesignal/ngx';

// import { DisclaimerPage } from '../pages/disclaimer/disclaimer';
// import { HomePage } from '../pages/home/home';
// import { ApiProvider } from '../providers/api/api';

import { ApiService } from './services/api.service';

import { AndroidPermissions } from '@ionic-native/android-permissions/ngx';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  providers: [AndroidPermissions]
})
export class AppComponent implements OnInit {

  claims;

  loading;

  disconection = true;
  conection = true;

  name = "";
  id = "";

  multiple = [];

  constructor(public cdr: ChangeDetectorRef, public platform: Platform, public statusBar: StatusBar, public splashScreen: SplashScreen, public api: ApiService, private oneSignal: OneSignal, public nav: NavController,
    public events: EventsService, public loadCtrl: LoadingController, private network: Network, public alertCtrl: AlertController, private transfer: FileTransfer, public menu: MenuController,
    private androidPermissions: AndroidPermissions) {

    /**/

    // this.androidPermissions.checkPermission(this.androidPermissions.PERMISSION.CAMERA).then(
    //   result => console.log('Has permission?',result.hasPermission),
    //   err => this.androidPermissions.requestPermission(this.androidPermissions.PERMISSION.CAMERA)
    // );

    /**/

    localStorage.setItem('connected','true');

    this.makeConnection();

    this.network.onDisconnect().subscribe(() => {
      if (this.disconection) {
        
        localStorage.setItem('connected','false');

        // localStorage.removeItem('images');
        // localStorage.removeItem('videos');
        // localStorage.removeItem('infos');

        this.disconection = false;
        this.conection = true

        console.log('network was disconnected');

        let _alert = this.alertCtrl.create({message:"La connessione Internet è andata persa, passerà alla modalità offline",buttons: [{text: "Ok"}]});
        _alert.then(a=>{a.present()});

      }
    });

    // let data = JSON.parse(localStorage.getItem('offlineClaims'));

    // this.api.saveOfflineClaims(data)
    // .subscribe(()=>{
    //   localStorage.removeItem('offlineClaims');
    // });

    this.network.onConnect().subscribe(() => {

      localStorage.setItem('connected','true');

      this.makeConnection();
    });

    this.initializeApp();
    this.events.destroy('RELOAD:SINISTER');
    this.events.subscribe('RELOAD:SINISTER',(loading = true)=>{
      if (loading) {
        this.loading = this.loadCtrl.create();
        this.loading.then(l=>{l.present()});
      }
      this.getClaims();
    });

    this.events.destroy('RELOAD:USER');
    this.events.subscribe('RELOAD:USER',()=>{
      this.name = JSON.parse(localStorage.getItem('techUser'))['name'];
      this.id = JSON.parse(localStorage.getItem('techUser'))['id'];
    });

    this.events.destroy('openSinister');
    this.events.subscribe('openSinister',(sin_number)=>{
      let claim = this.claims.find(x => x.sin_number == sin_number);

      console.log(this.claims,sin_number)

      if (claim) {
        localStorage.setItem('navParams',JSON.stringify({data:claim}));
        this.nav.navigateForward(['home']); // push(HomePage,{data:claim});
      }else{
        let alert = this.alertCtrl.create({message:"Riferimento interno non registrato",buttons: [{
          text: "Ok"
        }]});
        alert.then(a=>{a.present()});
      }
    });
  }
  makeConnection()
  {
    if (this.conection) {

      this.conection = false;
      this.disconection = true;

      setTimeout(()=>{
        let images = JSON.parse(localStorage.getItem('images')),
        videos = JSON.parse(localStorage.getItem('videos')),
        audios = JSON.parse(localStorage.getItem('audios')),
        infos = JSON.parse(localStorage.getItem('infos')),
        data = JSON.parse(localStorage.getItem('offlineClaims')),
        i,elem,alertar = false;

        localStorage.removeItem('images');
        localStorage.removeItem('videos');
        localStorage.removeItem('audios');
        localStorage.removeItem('infos');

        this.api.saveOfflineClaims(data)
        .subscribe(async data=>{
          localStorage.removeItem('offlineClaims');
          if (images != null) {
            alertar = true;
            for (i = 0; i < images.length; i++) {
              elem = images[i];
              await this.uploadImage(elem.file,elem.id,elem.lat,elem.lng,elem.address,elem.sin_number,1);
            }
          }
          if (videos != null) {
            alertar = true;
            for (i = 0; i < videos.length; i++) {
              elem = videos[i];
              await this.uploadVideo(elem.file,elem.id,elem.lat,elem.lng,elem.address,elem.sin_number,1);
            }
          }
          if (audios != null) {
            alertar = true;
            for (i = 0; i < audios.length; i++) {
              elem = audios[i];
              await this.uploadAudio(elem.file,elem.name,elem.id,elem.lat,elem.lng,elem.address,elem.sin_number,1);
            }
          }
          if (infos != null) {
            alertar = true;
            for (i = 0; i < infos.length; i++) {
              let info = JSON.parse(localStorage.getItem('information-'+infos[i]));
              localStorage.removeItem('information-'+infos[i]);
              await this.uploadInformation(info);
            }
          }

          if (alertar) {
            let alert = this.alertCtrl.create({message: "Tutte le informazioni sono state salvate correttamente"})
            alert.then(a=>{a.present()});
          }

          // setTimeout(()=>{
            this.events.publish('getClaimMedia');
          // },3000)


          this.getClaims();
        })

      },2000)
    }
  }

  closeSelected()
  {
    this.menu.close();
    this.multiple = [];

    let sinisters = Array.from(document.querySelectorAll('.sinisters:checked'));

    if (sinisters.length > 0) {
      sinisters.forEach((s)=>{
        this.multiple.push((s as HTMLInputElement).value);
      })
      console.log(this.multiple);
      let _alert = this.alertCtrl.create({message:"Vuoi chiudere tutti gli sinistri selezionati?",buttons: [{text: "Annullare"},
        {text: "Accettare",handler: ()=>{

        let load = this.loadCtrl.create();
        load.then(l=>{l.present()});
        
        this.api.closeSelected(this.multiple).subscribe(data=>{

          this.getClaims();
          this.loadCtrl.dismiss();
        },()=>{
          this.getClaims();
          this.loadCtrl.dismiss();
        })
      }}]});

      _alert.then(a=>{a.present()});
    }
  }

  getClaims()
  {
    this.claims = JSON.parse(localStorage.getItem('allClaims'));

    this.api.getClaims()
    .subscribe(data=>{
      this.claims = data;

      this.cdr.detectChanges();

      localStorage.setItem('allClaims',JSON.stringify(data));

      if (this.loading) {
        this.loadCtrl.dismiss()
        this.loading = null;
      }
    },()=>{

      let aux = this.claims;

      this.claims = [];

      setTimeout(()=>{
        this.claims = aux;
      })

      if (this.claims.length == 0) {
        console.log("0 claims")
        this.claims = JSON.parse(localStorage.getItem('allClaims'));
        console.log('this.claims',this.claims)
      }

      if (this.loading) {
        this.loadCtrl.dismiss()
        this.loading = null;
      }
    })
  }

  uploadInformation(info)
  {
    return new Promise(resolve => {

      this.api.uploadInformation(info)
      .subscribe(data=>{
        resolve(true);
        console.log('DONE')
      })
    })
  }

  uploadVideo(path,id,lat,lng,address,sin_number,offline = 0) {

    return new Promise(resolve => {

      const fileTransfer: FileTransferObject = this.transfer.create();

      let options: FileUploadOptions = {
         fileKey: 'file',
         fileName: 'video',
         chunkedMode: false,
         params: {id: id, lat: lat, lng: lng, address: address, sin_number:sin_number,offline:offline},
         mimeType: 'video/mp4',
         headers:{Connection: 'close'}
      }
      let loading = this.loadCtrl.create({
        message: "Uploading video file..."
      });
      loading.then(l=>{l.present()});

      fileTransfer.upload(path, this.api.url+'/api/uploadVideoTech', options)
       .then((data) => {
        this.loadCtrl.dismiss();
        // this.events.publish('getClaimMedia');
         resolve(true);
       }, (err) => {
         resolve(true);
         this.loadCtrl.dismiss();
         alert('upload err: '+JSON.stringify(err, Object.getOwnPropertyNames(err)));
       })
    })
  }

  uploadAudio(path,name,id,lat,lng,address,sin_number,offline = 0) {

    return new Promise(resolve => {
      const fileTransfer: FileTransferObject = this.transfer.create();

      let options: FileUploadOptions = {
         fileKey: 'file',
         fileName: name,
         chunkedMode: false,
         params: {id:id,lat:lat,lng:lng,address:address,sin_number:sin_number,offline:offline},
         headers:{Connection: 'close'}
      }

      let loading = this.loadCtrl.create();
      loading.then(l=>{l.present()});

      fileTransfer.upload(path, this.api.url+'/api/uploadAudioTech', options)
       .then((data) => {
         this.loadCtrl.dismiss()
         // this.events.publish('getClaimMedia');
         resolve(true);
       }, (err) => {
         resolve(true);
         this.loadCtrl.dismiss()
         alert('upload err: '+JSON.stringify(err, Object.getOwnPropertyNames(err)));
       })
    })
  }

  uploadImage(path,id,lat,lng,address,sin_number,offline = 0) {

    return new Promise(resolve => {
      const fileTransfer: FileTransferObject = this.transfer.create();

      let options: FileUploadOptions = {
         fileKey: 'file',
         fileName: 'ionicFile.jpg',
         chunkedMode: false,
         params: {id:id,lat:lat,lng:lng,address:address,sin_number:sin_number,offline:offline},
         headers:{Connection: 'close'}
      }

      let loading = this.loadCtrl.create();
      loading.then(l=>{l.present()});

      fileTransfer.upload(path, this.api.url+'/api/uploadFileImageTech', options)
       .then((data) => {
         this.loadCtrl.dismiss()
         // this.events.publish('getClaimMedia');
         resolve(true);
       }, (err) => {
         resolve(true);
         this.loadCtrl.dismiss()
         alert('upload err: '+JSON.stringify(err, Object.getOwnPropertyNames(err)));
       })
    })
  }

  check(data,respaldo = null)
  {
    localStorage.setItem('navParams',JSON.stringify({data:data,respaldo:respaldo}));
    this.events.publish('back');
    setTimeout(()=>{
      this.menu.close();
      this.nav.navigateForward('home'); //(HomePage,{data:data,respaldo:respaldo})
    },100)
  }

  initializeApp() {
    this.platform.ready().then(() => {

      if (localStorage.getItem('techUser')) {
        this.name = JSON.parse(localStorage.getItem('techUser'))['name'];
        this.id = JSON.parse(localStorage.getItem('techUser'))['id'];
        this.getClaims();
      }

      this.events.subscribe('getClaims',()=>{
        this.getClaims();
      })

      this.handlerNotifications();
      
      // Okay, so the platform is ready and our plugins are available.
      // Here you can do any higher level native things you might need.
      this.statusBar.styleDefault();
      this.statusBar.show();
      this.statusBar.overlaysWebView(false);
      this.statusBar.styleLightContent();
      this.splashScreen.hide();

      this.androidPermissions.checkPermission(this.androidPermissions.PERMISSION.READ_EXTERNAL_STORAGE).then(
        result => {
          if (result.hasPermission) {
            // code
          } else {
            this.androidPermissions.requestPermission(this.androidPermissions.PERMISSION.READ_EXTERNAL_STORAGE).then(result => {
              if (result.hasPermission) {
                // code
              }
            });
          }
        },
        err => this.androidPermissions.requestPermission(this.androidPermissions.PERMISSION.READ_EXTERNAL_STORAGE)
      );

      this.androidPermissions.checkPermission(this.androidPermissions.PERMISSION.WRITE_EXTERNAL_STORAGE).then(
        result => {
          if (result.hasPermission) {
            // code
          } else {
            this.androidPermissions.requestPermission(this.androidPermissions.PERMISSION.WRITE_EXTERNAL_STORAGE).then(result => {
              if (result.hasPermission) {
                // code
              }
            });
          }
        },
        err => this.androidPermissions.requestPermission(this.androidPermissions.PERMISSION.WRITE_EXTERNAL_STORAGE)
      );

      this.androidPermissions.checkPermission(this.androidPermissions.PERMISSION.CAMERA).then(
        result => {
          if (result.hasPermission) {
            // code
          } else {
            this.androidPermissions.requestPermission(this.androidPermissions.PERMISSION.CAMERA).then(result => {
              if (result.hasPermission) {
                // code
              }
            });
          }
        },
        err => this.androidPermissions.requestPermission(this.androidPermissions.PERMISSION.CAMERA)
      );

      // this.androidPermissions.requestPermissions(
      // [
      //   this.androidPermissions.PERMISSION.CAMERA,
      //   this.androidPermissions.PERMISSION.WRITE_EXTERNAL_STORAGE
      // ]);
    });
  }

  /**/

  private handlerNotifications(){
    if (this.platform.is('cordova')) {
      this.oneSignal.startInit('18f7db09-4143-4d1f-a828-a4e2124cb111', '62677612366');
      this.oneSignal.inFocusDisplaying(this.oneSignal.OSInFocusDisplayOption.None);

      this.oneSignal.handleNotificationReceived()
      .subscribe(jsonData => {
        let alert = this.alertCtrl.create({
          header: jsonData.payload.title,
          message: jsonData.payload.body,
          buttons: ['OK']
        });
        alert.then(a=>{a.present()});
        
        this.events.publish('RELOAD:SINISTER');

        console.log('notificationOpenedCallback: ' + JSON.stringify(jsonData));
      })

      this.oneSignal.handleNotificationOpened()
      .subscribe(jsonData => {
        // let alert = this.alertCtrl.create({
        //   header: jsonData.notification.payload.title,
        //   message: jsonData.notification.payload.body,
        //   buttons: ['OK']
        // });
        // alert.then(a=>{a.present()});
        
        this.events.publish('RELOAD:SINISTER');

        console.log('notificationOpenedCallback: ' + JSON.stringify(jsonData));
      });
      this.oneSignal.endInit();

      this.oneSignal.getIds().then((ids)=> {localStorage.setItem('oneSignalIdTech',ids.userId); /*alert(ids.userId)*/});

      if (localStorage.getItem('techUser')) {
        let onesignalId = localStorage.getItem('oneSignalIdTech');

        this.api.techDeviceId(onesignalId)
        .subscribe(
          data => {console.log('ok');},
          err => {console.log(err);}
        );
      }
    }
  }

  ngOnInit() {
  }

  autoassign()
  {
    this.menu.close();
    this.events.publish('back');
    this.events.publish('new');
  }
}
