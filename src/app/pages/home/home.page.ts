// import { Component, OnInit } from '@angular/core';

// @Component({
//   selector: 'app-home',
//   templateUrl: './home.page.html',
//   styleUrls: ['./home.page.scss'],
// })
// export class HomePage implements OnInit {

//   constructor() { }

//   ngOnInit() {
//   }

// }

import { Component, ViewChild, ElementRef, OnInit } from '@angular/core';
import { NavController, ActionSheetController, LoadingController, AlertController, Platform, ModalController } from '@ionic/angular';
import { FileTransfer, FileUploadOptions, FileTransferObject } from '@ionic-native/file-transfer/ngx';
import { MediaCapture, MediaFile, CaptureError } from '@ionic-native/media-capture/ngx';
import { Camera, CameraOptions } from '@ionic-native/camera/ngx';
import { StreamingMedia, StreamingVideoOptions } from '@ionic-native/streaming-media/ngx';
import { PhotoViewer } from '@ionic-native/photo-viewer/ngx';
// import { Device } from '@ionic-native/device';
// import { InformationPage } from '../information/information';
import { ApiService } from '../../services/api.service';
import { EventsService } from '../../services/events.service';

import { MapModalPage } from '../map-modal/map-modal.page';

import { Media, MediaObject } from '@awesome-cordova-plugins/media/ngx';

import { Geolocation } from '@ionic-native/geolocation/ngx';

import { InAppBrowser } from '@ionic-native/in-app-browser/ngx';

import { ImagePicker } from '@awesome-cordova-plugins/image-picker/ngx';

// import * as html2canvas from 'html2canvas';

declare var google;

declare var $:any;

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
  providers: [Camera, FileTransfer, MediaCapture, StreamingMedia, PhotoViewer, Geolocation, InAppBrowser, Media, ImagePicker]
})
export class HomePage implements OnInit {
  @ViewChild('map') mapElement: ElementRef;
  data;

  offline = [];

  clase;
  _clase;
  map;
  media;
  audios_offline = [];
  media_offline = [];
  video_offline = [];
  actionSheet;

  connected;

  respaldo;
  navParams;

  time = "00:00:00";

  sec = 0;
  min = 0;
  hrs = 0;
  t;

  slideOpts = {
	  slidesPerView: 3,
	  spaceBetween: 10
	}

  actualAudio;

  constructor(private media1: Media, public platform: Platform, public navCtrl: NavController, /*private device: Device,*/ public action: ActionSheetController, public loading: LoadingController, public photoViewer: PhotoViewer, public geolocation: Geolocation,
    public iab: InAppBrowser, public modal: ModalController, private imagePicker: ImagePicker,
    private transfer: FileTransfer, private camera: Camera, private mediaCapture: MediaCapture, public api: ApiService, public events: EventsService, public streamingMedia: StreamingMedia, public alertCtrl: AlertController, public loadingCtrl: LoadingController) {

  	this.navParams = JSON.parse(localStorage.getItem('navParams'));

  	console.log(this.navParams);
    
    this.data = this.navParams['data'];
    this.respaldo = this.navParams['respaldo'];

    localStorage.setItem('respaldo',JSON.stringify(this.respaldo));

  	this.loadMap = this.loadMap.bind(this);
    this.connected = localStorage.getItem('connected');

    let images = JSON.parse(localStorage.getItem('images'));
    let videos = JSON.parse(localStorage.getItem('videos'));

    let offline = JSON.parse(localStorage.getItem('offlineClaims'));

    if (images) {
      this.media_offline = images.filter(x => x.sin_number == this.data['sin_number']);
    }
    /**/
    if (videos) {
      this.video_offline = videos.filter(x => x.sin_number == this.data['sin_number']);
    }

    if (offline) {
      this.offline = offline.filter(x => x.claim_id == this.data['id']);
    }

    this.getClaimMedia();

    if ((navigator.userAgent.match(/iPhone/)) || (navigator.userAgent.match(/iPod/))) {
      // if (this.device.model.match(/iPhone10/)) {
      //   this.clase = 'calc-iPhoneX';
      //   this._clase = 'calc218';
      // }else{
        this.clase = 'calc44';
        this._clase = 'calc182';
      // }
    }
    if (navigator.userAgent.match(/Android/)) {
        this.clase = 'calc56';
        this._clase = 'calc156';
    }

    this.events.destroy('back');
    this.events.subscribe('back',()=>{
      this.navCtrl.navigateBack('form');
    })

    this.events.destroy('getClaimMedia');
    this.events.subscribe('getClaimMedia',()=>{
      this.media_offline = [];
      this.video_offline = [];
      this.getClaimMedia();
    })
    this.events.destroy('RELOAD:INSIDE');
    this.events.subscribe('RELOAD:INSIDE',()=>{
      this.api.getClaim(this.data.id)
      .subscribe(data=>{
        this.data = data;
      })
    })

    this.events.destroy('uploadExtraFile');
    this.events.subscribe('uploadExtraFile', async ()=>{

      let images = this.images; /*JSON.parse(localStorage.getItem('photoimage'));*/

      // let allImages:any = [];

      let lat = localStorage.getItem('photolat');
      let lng = localStorage.getItem('photolng');
      let address = localStorage.getItem('photoaddress');
      let date = localStorage.getItem('photodate');

      let formData = new FormData();

      formData.append('id', JSON.parse(localStorage.getItem('techUser'))['id']);
      formData.append('lat', lat);
      formData.append('lng', lng);
      formData.append('address', address);
      formData.append('sin_number', this.data['sin_number']);
      formData.append('offline','0');
      formData.append('date', date);

      let j = 0;

      for (let i of images) {
        let blob = await this.b64toBlob(i, "image/jpeg");

        console.log(blob);

        // let file = new File([blob], "image.jpg");

        // console.log(file);

        // await allImages.push(file);

        formData.append('images[]', blob, 'image_'+j+'.jpg');

        j++;

      }

      this.loadingCtrl.create().then(a=>{
        a.present();

        $.ajax({
          url: this.api.url+'/api/uploadExternalImageTech',
          type: 'POST',
          processData: false,
          contentType: false,
          data: formData,
        })
        .done(()=> {
          a.dismiss();
          console.log("success");
          // this.alertCtrl.create()
          this.getClaimMedia();
        })
        .fail(()=> {
          a.dismiss();
          console.log("error");
        })
        .always(()=> {
          a.dismiss();
          console.log("complete");
        });

      })

      // await this.uploadExternalImageTech(i);

    })

    this.reloadPosition();
  }

  ngOnInit() {
    
  }

  newSin()
  {
    // if (localStorage.getItem('connected') == 'false') {
    //   let alert = this.alertCtrl.create({message: "Devi aspettare di avere una connessione Internet stabile per poter aprire il sinistro"});
    //   return alert.then(a=>{a.present()});
    // }
    let _alert = this.alertCtrl.create({message: "Vuoi aprire una partita di danno?",inputs: [{
      type: "text",
      placeholder: "Nome per partita di danno...",
      name: "name"
    }],buttons:[
    {
        text: "Accettare",
        handler: (elem)=>{
          if (!elem.name) {
            return false;
          }

          if (localStorage.getItem('connected') == 'false') {

            let offline = this.offline.length;

            // let index = this.data.claims.length+offline+1;

            let index = offline+1;

            if (this.data.claims.length > 0) {
              index = parseInt(this.data.claims.pop().sin_number.split('-')[1])+offline+1;
            }

            let claim = {
              claim_id: this.data.id,
              name:elem.name,
              status:0,
              society:this.data.society,
              email1:this.data.email1,
              email2:this.data.email2,
              information:'{"typology":"'+elem.name+'"}',
              json_information: {"main_information":[
                  {"key":"typology","question":"Partita di danno","value":this.navParams.json_information},
                  {"key":"sin_number","question":"Riferimento Interno","value":this.data.sin_number+"-"+index}
                ],"questions":[]
              },
              user_id:this.data.user_id,
              sin_number:this.data.sin_number+"-"+index
            };

            let claims = [];

            this.media_offline = [];
            this.video_offline = [];

            if (localStorage.getItem('offlineClaims')) {
              claims = JSON.parse(localStorage.getItem('offlineClaims'));
            }

            claims.push(claim);

            localStorage.setItem('offlineClaims',JSON.stringify(claims));

            this.events.publish('RELOAD:SINISTER');

            this.data = claim;
            
          }else{
            let load = this.loading.create();
            load.then((l)=>{l.present();});
            this.api.createSubproduct(this.data['sin_number'],elem.name)
            .subscribe(data=>{
              this.loading.dismiss();
              this.events.publish('RELOAD:SINISTER');
              this.data = data[0];
              localStorage.setItem('respaldo',JSON.stringify(data[1]));
              this.media = [];
            })
          }
        }
      },{
	      text: "Annullare"
	    }
    ]});

    // _alert.addInput()

    // _alert.addButton()

    // _alert.addButton();
    _alert.then(a=>{a.present()});
  }

  closeSin()
  {
    if (localStorage.getItem('connected') == 'false') {
      let alert = this.alertCtrl.create({message: "Devi aspettare di avere una connessione Internet stabile per poter chiudere il sinistro"});
      return alert.then(a=>{a.present()});
    }
    let _alert = this.alertCtrl.create({message: "Conferma e chiudi",buttons:[
    	{
      text: "Accettare",
      handler: ()=>{
        let load = this.loading.create();
        load.then((l)=>{l.present();});
        this.api.closeSin(this.data['sin_number'])
        .subscribe(data=>{
          this.navCtrl.pop();
          this.loading.dismiss();
          this.events.publish('RELOAD:SINISTER');
        },()=>{
          this.navCtrl.pop();
          this.loading.dismiss();
          this.events.publish('RELOAD:SINISTER');
        })
      }
    },{
      text: "Annullare"
    }]});
    // _alert.addButton();

    // _alert.addButton();
    _alert.then(a=>{a.present()});
  }

  sendNotFinished(t)
  {
    let load = this.loading.create();
      load.then((l)=>{l.present();});
      this.api.notFinished(this.data['sin_number'],t)
      .subscribe(data=>{
        this.navCtrl.pop();
        this.loading.dismiss();
        this.events.publish('RELOAD:SINISTER');
      },()=>{
        this.navCtrl.pop();
        this.loading.dismiss();
        this.events.publish('RELOAD:SINISTER');
      })
  }

  notFinished()
  {
    let _alert = this.alertCtrl.create({message: "¿Indicare a mappe che il sopralluogo non è stato fatto?",buttons:[
      {
      text: "Accettare",
      handler: ()=>{

        this.alertCtrl.create({message: "¿Hai fatto un viaggio a vuoto?", buttons: [{
          text: "Si",
          handler: ()=>{
            this.sendNotFinished(true);
          }
        },{
          text: "No",
          handler: ()=>{
            this.sendNotFinished(false);
          }
        }]}).then(a=>a.present());
        
      }
    },{
      text: "Annullare"
    }]});
    // _alert.addButton();

    // _alert.addButton();
    _alert.then(a=>{a.present()});
  }

  closeSub(claim_id)
  {
    let load = this.loading.create();
    load.then((l)=>{l.present();});

    this.api.getClaim(claim_id)
    .subscribe(data=>{
      this.data = data;
      this.loading.dismiss();
    },()=>{
      // this.data = this.respaldo;
      this.data = JSON.parse(localStorage.getItem('respaldo'));

      // console.log(this.respaldo)

      let offline = JSON.parse(localStorage.getItem('offlineClaims'));
      if (offline) {
        this.offline = offline.filter(x => x.claim_id == this.data['id']);
      }
      // this.navCtrl.pop();
      this.loading.dismiss();
    })
  }

  removeSub(id)
  {
    console.log(id)
    let alert = this.alertCtrl.create({
      message: "Eliminerai questa partita di danno?",buttons: [{
      text: "Si",
      handler:()=>{
        let load = this.loading.create();
        load.then((l)=>{l.present();});
        this.api.deleteSub(id)
        .subscribe(data=>{
          this.data = data;
          this.events.publish('RELOAD:SINISTER',false);
          this.loading.dismiss();
        },()=>{
          this.loading.dismiss();
        })
      }
    },{
      text: "No"
    }]
    })
    // alert.addButton()
    // alert.addButton()
    alert.then(a=>{a.present()});
  }

  check(claim)
  {
    // this.respaldo = this.data;
    this.data = claim;
    let load = this.loading.create();
    load.then((l)=>{l.present();});

    this.api.getClaimMedia(this.data['sin_number'])
    .subscribe(data=>{

      let images = JSON.parse(localStorage.getItem('images'));
      let videos = JSON.parse(localStorage.getItem('videos'));

      if (images) {
        this.media_offline = images.filter(x => x.sin_number == this.data['sin_number']);
      }
      /**/
      if (videos) {
        this.video_offline = videos.filter(x => x.sin_number == this.data['sin_number']);
      }
      
      this.media = data;
      this.loading.dismiss();
    },()=>{

      let images = JSON.parse(localStorage.getItem('images'));
      let videos = JSON.parse(localStorage.getItem('videos'));

      if (images) {
        this.media_offline = images.filter(x => x.sin_number == this.data['sin_number']);
      }
      /**/
      if (videos) {
        this.video_offline = videos.filter(x => x.sin_number == this.data['sin_number']);
      }

      this.loading.dismiss();
    })
  }

  async presentModal() {
    const modal = await this.modal.create({
      component: MapModalPage,
      cssClass: 'my-custom-class'
    });
    return await modal.present();
  }

  select()
  {
    let actionSheet = this.action.create({
     header: 'Seleziona cosa caricare',
     buttons: [
       {
         text: 'Scatta Foto',
         role: 'destructive',
         handler: () => {
           this.takePicture();
         }
       },
       {
         text: 'Seleziona Foto',
         role: 'destructive',
         handler: () => {
           // this.presentModal();
           this.selectPicture();
         }
       },
       {
         text: 'Audio',
         role: 'destructive',
         handler: () => {
           this.takeAudio();
         }
       },
       {
         text: 'Video',
         role: 'destructive',
         handler: () => {
           this.takeVideo();
         }
       },
       {
         text: 'Annullare',
         role: 'cancel',
         handler: () => {
         }
       }
     ]
    });
    actionSheet.then(a=>{a.present()}); 
  }

  getClaimMedia()
  {
    console.log('getting media')
    this.api.getClaimMedia(this.data['sin_number'])
    .subscribe(data=>{
      this.media = data;
      console.log(data);
    })
  }

  images = [];

  selectPicture()
  {
    let options;
    options = {
      quality: 50,
      outputType: 1
    };

    this.imagePicker.getPictures(options).then(async (results) => {

      let connected = localStorage.getItem('connected');

      if (connected == 'true') {

        this.images = [];
        for (var i = 0; i < results.length; i++) {
          await this.images.push(results[i]);
          // console.log('Image URI: ' + results[i]);
        }
        // localStorage.setItem('photoimage',JSON.stringify(images));
        this.presentModal();

      }else{
        let alr = this.alertCtrl.create({message:"È necessario disporre di una connessione Internet per selezionare una foto, poiché è necessario selezionare anche la sua posizione sulla mappa",buttons: [{text: "Ok"}]});
        alr.then(a=>{a.present()});
      }
    }, (err) => { console.log(err); });
  }

  takePicture()
  {
    let options: CameraOptions;
    options = {
      quality: 50,
      sourceType: this.camera.PictureSourceType.CAMERA,
      destinationType: this.camera.DestinationType.FILE_URI,
      encodingType: this.camera.EncodingType.JPEG,
      mediaType: this.camera.MediaType.PICTURE,
      // targetWidth: 1080,
      // targetHeight: 1920,
      correctOrientation: true
    }

    this.camera.getPicture(options).then((imageData) => {
      // this.imageURI = 'data:image/jpeg;base64,' + imageData;
      // this.sendPicture();

      let connected = localStorage.getItem('connected');

      // html2canvas(document.querySelector('.gm-style>div:first-child'),{
      //     useCORS: true,
      //     optimized: false,
      //     allowTaint: false,
      //     scale: 1.5
      // }).then((canvas)=> {

        // alert(imgData);

        // alert('connected '+connected);

        if (connected == 'true') {
          // alert('con'+imgData);
          this.uploadImage(imageData);
        }else{

          let images = [];
          let lat = localStorage.getItem('lat');
          let lng = localStorage.getItem('lng');
          let address = localStorage.getItem('address');

          if (localStorage.getItem('images')) {
            images = JSON.parse(localStorage.getItem('images'));
          }

          images.push({id: JSON.parse(localStorage.getItem('techUser'))['id'], lat: lat, lng: lng, address: address, sin_number: this.data['sin_number'], file:imageData, type: 'image', preview: "../assets/imgs/default.png",
          timestamp: new Date().getTime()})

          localStorage.setItem('images',JSON.stringify(images));

          this.media_offline = images.filter(x => x.sin_number == this.data['sin_number']);

          let alr = this.alertCtrl.create({message:"L'immagine verrà caricata quando viene ripristinata la connessione Internet",buttons: [{text: "Ok"}]});
          // alr.addButton();
          alr.then(a=>{a.present()});

        }
      // }).catch((err)=>{
      //   alert('err canvas '+JSON.stringify(err))
      // });

      // let sel = document.querySelector('#videoSelected') as HTMLSelectElement;
      //  this.webRTCClient.setVideoSourceId(sel.value);
    }, (err) => {
    });
  }
  
  audioPath;
  audio;
  isAudioRecording;
  recording;
  fileName

  takeAudio()
  {
    try {
      this.fileName =
      'record' +
      new Date().getDate() +
      new Date().getMonth() +
      new Date().getFullYear() +
      new Date().getHours() +
      new Date().getMinutes() +
      new Date().getSeconds();
      // let filePath = '';
      if (this.platform.is('ios')) {

        this.fileName = this.fileName + '.m4a';
        this.audioPath = this.api.file.documentsDirectory + this.fileName;
        this.audio = this.media1.create(this.audioPath.replace(/file:\/\//g, ''));

      } else if (this.platform.is('android')) {
        this.fileName = this.fileName + '.mp3';
        this.audioPath = this.api.file.externalDataDirectory + this.fileName;
        this.audio = this.media1.create(this.audioPath.replace(/file:\/\//g, ''));
      }
      this.audio.startRecord();
      this.isAudioRecording = true;
      this.recording = true;
      this.time = "00:00:00";
      this.sec = 0;
      this.min = 0;
      this.hrs = 0;
      this.timer();

    } catch (error) {
      console.log(error);
    }
  }

  tick()
  {
    this.sec++;
    if (this.sec >= 60) {
        this.sec = 0;
        this.min++;
        if (this.min >= 60) {
            this.min = 0;
            this.hrs++;
        }
    }
  }

  add() {
    this.tick();
    this.time = (this.hrs > 9 ? this.hrs : "0" + this.hrs) 
             + ":" + (this.min > 9 ? this.min : "0" + this.min)
              + ":" + (this.sec > 9 ? this.sec : "0" + this.sec);
    this.timer();
  }

  timer() {
    this.t = setTimeout(()=>{this.add();}, 1000);
  }

  stopAudio() {
    this.audio.stopRecord();
    this.recording = false;
    // this.isAudioRecording = false;

    clearTimeout(this.t);
  }

  playAudio() {
    try {
      this.audio = this.media1.create(this.audioPath.replace(/file:\/\//g, ''));
      this.audio.play();
      this.audio.setVolume(0.8);
    } catch (error) {
      console.log(error);
    }
  }

  uploadAudio()
  {
    let connected = localStorage.getItem('connected');

    if (connected == 'true') {
      this.uploadAudioTech();
    }else{
      let audios = [];
      let lat = localStorage.getItem('lat');
      let lng = localStorage.getItem('lng');
      let address = localStorage.getItem('address');

      if (localStorage.getItem('audios')) {
        audios = JSON.parse(localStorage.getItem('audios'));
      }

      audios.push({id: JSON.parse(localStorage.getItem('techUser'))['id'], lat: lat, lng: lng, address: address, sin_number: this.data['sin_number'], file:this.audioPath, type: 'audio', preview: "../assets/imgs/default_audio.png",
      timestamp: new Date().getTime(), name: this.fileName})

      localStorage.setItem('audios',JSON.stringify(audios));

      this.audios_offline = audios.filter(x => x.sin_number == this.data['sin_number']);

      this.discardAudio();

      let alert = this.alertCtrl.create({message:"Il audio verrà caricato quando viene ripristinata la connessione Internet",buttons: [{text: "Ok"}]});
      // alert.addButton();
      alert.then(a=>{a.present()});
    }
  }

  uploadAudioTech()
  {
    const fileTransfer: FileTransferObject = this.transfer.create();

    let lat = localStorage.getItem('lat');
    let lng = localStorage.getItem('lng');
    let address = localStorage.getItem('address');

    let options: FileUploadOptions = {
       fileKey: 'file',
       fileName: this.fileName,
       chunkedMode: false,
       params: {id: JSON.parse(localStorage.getItem('techUser'))['id'], lat: lat, lng: lng, address: address, sin_number: this.data['sin_number'], offline:0},
       mimeType: 'audio/mp3',
       headers:{Connection: 'close'}
    }
    let loading = this.loading.create({
      message: "Uploading audio file..."
    });
    loading.then(l=>{l.present()});

    fileTransfer.upload(this.audioPath, this.api.url+'/api/uploadAudioTech', options)
     .then((data) => {
      this.loading.dismiss();
      this.getClaimMedia();

      this.discardAudio();
        
     }, (err) => {
       this.loading.dismiss();
       
       console.log(JSON.stringify(err, Object.getOwnPropertyNames(err)));

       alert('upload err: '+JSON.stringify(err, Object.getOwnPropertyNames(err)));
     })
  }

  discardAudio()
  {
    this.time = "00:00:00";
    this.isAudioRecording = false;
    this.audioPath = null;
    this.audio.release();
  }

  takeVideo()
  {
    this.mediaCapture.captureVideo()
    .then(
      (data: MediaFile[]) => {
        // alert('path: '+JSON.stringify(data));
        // type = 'video/mp4'
        let connected = localStorage.getItem('connected');

        // alert('connected '+connected);

        if (connected == 'true') {
          console.log(data);
          this.uploadVideo('video',data[0]['fullPath']);
        }else{
          
          let videos = [];
          let lat = localStorage.getItem('lat');
          let lng = localStorage.getItem('lng');
          let address = localStorage.getItem('address');

          if (localStorage.getItem('videos')) {
            videos = JSON.parse(localStorage.getItem('videos'));
          }

          videos.push({id: JSON.parse(localStorage.getItem('techUser'))['id'], lat: lat, lng: lng, address: address, sin_number: this.data['sin_number'], file:data[0]['fullPath'], type: 'video', preview: "../assets/imgs/video.png",
          timestamp: new Date().getTime()})

          localStorage.setItem('videos',JSON.stringify(videos));

          // this.video_offline = JSON.parse(localStorage.getItem('videos'));

          this.video_offline = videos.filter(x => x.sin_number == this.data['sin_number']);

          let alert = this.alertCtrl.create({message:"Il video verrà caricato quando viene ripristinata la connessione Internet",buttons: [{text: "Ok"}]});
          // alert.addButton();
          alert.then(a=>{a.present()});

        }
      },
      (err: CaptureError) => console.log(err)
    );
  }

  uploadVideo(name, path) {
    const fileTransfer: FileTransferObject = this.transfer.create();

    let lat = localStorage.getItem('lat');
    let lng = localStorage.getItem('lng');
    let address = localStorage.getItem('address');

    let options: FileUploadOptions = {
       fileKey: 'file',
       fileName: name,
       chunkedMode: false,
       params: {id: JSON.parse(localStorage.getItem('techUser'))['id'], lat: lat, lng: lng, address: address, sin_number: this.data['sin_number'],offline:0},
       mimeType: 'video/mp4',
       headers:{Connection: 'close'}
    }
    let loading = this.loading.create({
      message: "Uploading video file..."
    });
    loading.then(l=>{l.present()});

    fileTransfer.upload(path, this.api.url+'/api/uploadVideoTech', options)
     .then((data) => {
      this.loading.dismiss();

      // alert(JSON.parse(data['response'])[0]);
      this.getClaimMedia();
        
     }, (err) => {
       this.loading.dismiss();
       
       console.log(JSON.stringify(err, Object.getOwnPropertyNames(err)));

       alert('upload err: '+JSON.stringify(err, Object.getOwnPropertyNames(err)));
     })
  }

  uploadImage(path) {

    // alert('inside'+imgData);

    const fileTransfer: FileTransferObject = this.transfer.create();

    let lat = localStorage.getItem('lat');
    let lng = localStorage.getItem('lng');
    let address = localStorage.getItem('address');

    let options: FileUploadOptions = {
       fileKey: 'file',
       fileName: 'ionicFile.jpg',
       chunkedMode: false,
       params: {id: JSON.parse(localStorage.getItem('techUser'))['id'], lat: lat, lng: lng, address: address, sin_number: this.data['sin_number'],offline:0},
       headers:{Connection: 'close'}
    }

    let loading = this.loading.create();
    loading.then(l=>{l.present()});

    fileTransfer.upload(path, this.api.url+'/api/uploadFileImageTech', options)
     .then((data) => {
       this.loading.dismiss();

       // alert(JSON.parse(data['response'])[0])
       this.getClaimMedia();

     }, (err) => {
       this.loading.dismiss();
       alert('upload err: '+JSON.stringify(err, Object.getOwnPropertyNames(err)));
     })
  }

  addInfoWindow(marker, content){
 
    let infoWindow = new google.maps.InfoWindow({
      message: content
    });
   
    google.maps.event.addListener(marker, 'click', () => {
      infoWindow.open(this.map, marker);
    });
  }

  ionViewDidLoad(){
  	this.loadMap();
  }

  loadMap(){

  	this.loading.dismiss();

    // let load = this.loading.create();
    // load.then((l)=>{l.present();});
 
    let latLng = new google.maps.LatLng(localStorage.getItem('lat'), localStorage.getItem('lng'));

    let mapOptions = {
      center: latLng,
      zoom: 18,
      mapTypeId: google.maps.MapTypeId.ROADMAP,
      mapTypeControl: false,
      streetViewControl: false,
      rotateControl: false,
      fullscreenControl: false,
      styles: []
    }

    this.map = new google.maps.Map(this.mapElement.nativeElement, mapOptions);

    let marker = new google.maps.Marker({
      map: this.map,
      animation: google.maps.Animation.DROP,
      position: this.map.getCenter()
    });
   
    let content = localStorage.getItem('address');
   
    this.addInfoWindow(marker, content);

    // this.loading.dismiss();
  }

  pressed(){
    console.log("pressed");
  }
  active(id){

    // if (this.actionSheet) {
    //   return false;
    // }

    this.actionSheet = this.action.create({
     // title: 'Seleziona cosa caricare',
     buttons: [
       {
         text: "Elimina elemento",
         role: 'destructive',
         handler: () => {

           let alert = this.alertCtrl.create({
             header: "Elimina elemento",
             message: "Vuoi eliminare l'elemento selezionato?",
             buttons: [{
               text: "Accettare",
               handler:()=>{
                 let loading = this.loading.create({message: "Eliminazione elemento..."})
                 loading.then(l=>{l.present()});
                 this.api.deleteFile(id).subscribe(data=>{
                   console.log("Elemento eliminado",id);
                   this.loading.dismiss();
                   this.getClaimMedia(); // colocarlo cuando agregue la opcion de eliminar en la api
                 },()=>{
                   this.loading.dismiss();
                   this.alertCtrl.create({message: "Questa immagine non può essere cancellata senza connessione"}).then(a=>{a.present()});
                 });
               }
             },{
               text: "Annullare",
               handler: ()=> {
               }
             }]
           });
           alert.then(a=>{a.present()});
         }
       },
       {
         text: 'Annullare',
         role: 'cancel',
         handler: () => {
           console.log('cancelado')
           this.actionSheet = null;
         }
       }
     ]
    });
    this.actionSheet.then(a=>{
      a.present();
    });
    // this.actionSheet = null;
  }
  // released(){
  //   console.log("released");
  // }

  /**/

  activeOffline(i,type)
  {
    // if (this.actionSheet) {
    //   return false;
    // }

    this.actionSheet = this.action.create({
     // title: 'Seleziona cosa caricare',
     buttons: [
       {
         text: "Elimina elemento",
         role: 'destructive',
         handler: () => {

           let alert = this.alertCtrl.create({
             header: "Elimina elemento",
             message: "Vuoi eliminare l'elemento selezionato?",
             buttons: [{
               text: "Accettare",
               handler:()=>{
                 let all_media;
                 if (type == 'image') {
                   // this.media_offline.splice(i,1);
                   all_media = JSON.parse(localStorage.getItem('images'));
                   all_media.splice(all_media.findIndex(x => x.timestamp == i),1);

                   localStorage.setItem('images',JSON.stringify(all_media));

                   this.media_offline = all_media.filter(x => x.sin_number == this.data['sin_number']);
                 }
                 if (type == 'video') {
                   // this.video_offline.splice(i,1);
                   all_media = JSON.parse(localStorage.getItem('videos'));
                   all_media.splice(all_media.findIndex(x => x.timestamp == i),1);

                   localStorage.setItem('videos',JSON.stringify(all_media));

                   this.video_offline = all_media.filter(x => x.sin_number == this.data['sin_number']);
                 }
                 if (type == 'audio') {
                   // this.audio_offline.splice(i,1);
                   all_media = JSON.parse(localStorage.getItem('audios'));
                   all_media.splice(all_media.findIndex(x => x.timestamp == i),1);

                   localStorage.setItem('audios',JSON.stringify(all_media));

                   this.audios_offline = all_media.filter(x => x.sin_number == this.data['sin_number']);
                 }
               }
             },{
               text: "Annullare",
               handler: ()=> {
               }
             }]
           });
           alert.then(a=>{a.present()});
         }
       },
       {
         text: 'Annullare',
         role: 'cancel',
         handler: () => {
           console.log('cancelado')
           this.actionSheet = null;
         }
       }
     ]
    });
    this.actionSheet.then(a=>{
      a.present();
    });
    // this.actionSheet = null;
  }
  // releasedOffline()
  // {
  //   console.log("released");
  // }

  /**/

  showStop = false;
  doPause = false;

  preview(m)
  {
    let file;
    // console.log(decodeURIComponent(m.preview),m.preview);
    if (m.type == "video") {
      file = m.file;
    //   let options: StreamingVideoOptions = {
    //     successCallback: () => { console.log('Video played') },
    //     errorCallback: (e) => { console.log('Error streaming') },
    //     shouldAutoClose: true,
    //     controls: true
    //   };
    //   this.streamingMedia.playVideo(m.file, options);
    }else if(m.type == "image") {
    //   this.photoViewer.show( decodeURIComponent(m.preview), '', {share: false,});
      file = m.preview;
    }else if(m.type == "audio") {
    //   this.photoViewer.show( decodeURIComponent(m.preview), '', {share: false,});
    this.showStop = true;

    this.actualAudio = m.file;
      
      // try {
      //   this.audio = this.media1.create(m.file);
      //   // this.audio.play();

      //   this.audio.onStatusUpdate.subscribe(status => 
      //     {
      //       console.log('status update '+status);
      //       if (status == 2) {
      //         if (!this.doPause) {
      //           this.time = "00:00:00";
      //           this.sec = 0;
      //           this.min = 0;
      //           this.hrs = 0;
      //         }
      //         this.timer();
      //       }

      //       if (status == 4) {

      //         this.time = "00:00:00";
      //         this.sec = 0;
      //         this.min = 0;
      //         this.hrs = 0;
      //         clearTimeout(this.t);

      //       }
      //     }
      //   );

      //   this.audio.setVolume(0.8);
      // } catch (error) {

      //   console.log(error);
      // }
      return false;
    }
    let br = this.iab.create(file);
  }

  play(){
    (document.querySelector('audio') as any).play();
    if (!this.doPause) {
      this.time = "00:00:00";
      this.sec = 0;
      this.min = 0;
      this.hrs = 0;
    }
    this.timer();
  }
  pause(){
    (document.querySelector('audio') as any).pause();
    this.doPause = true;
    clearTimeout(this.t);
  }
  stop(){
    (document.querySelector('audio') as any).load();
    (document.querySelector('audio') as any).pause();
    this.time = "00:00:00";
    this.sec = 0;
    this.min = 0;
    this.hrs = 0;
    clearTimeout(this.t);
  }

  closeWindow()
  {
    // this.audio.stop();
    this.showStop = false;
    this.doPause = false;
    this.actualAudio = null;
    // this.audio.release();
    this.time = "00:00:00";
    this.sec = 0;
    this.min = 0;
    this.hrs = 0;
    clearTimeout(this.t);
  }

  onPlay()
  {

  }

  onPause()
  {

  }

  onStop()
  {
    // this.audio.stop();
    this.time = "00:00:00";
    this.sec = 0;
    this.min = 0;
    this.hrs = 0;
    clearTimeout(this.t);
  }

  reloadPosition()
  {
    console.log('reload')
    if (localStorage.getItem('connected') == 'true') {
      /**/
      let load = this.loadingCtrl.create({
        message: "Ottenere la posizione..."
      });
      load.then((l)=>{
      	l.present();
	      this.geolocation.getCurrentPosition({enableHighAccuracy: true,timeout: 10000,maximumAge: 0}).then((resp) => {
	        
	        localStorage.setItem('lat',resp.coords.latitude.toString());
	        localStorage.setItem('lng',resp.coords.longitude.toString());

	        var geo = new google.maps.Geocoder();

	        geo.geocode({'latLng': {lat: resp.coords.latitude, lng: resp.coords.longitude}}, function(results,status) {
	          localStorage.setItem('address',results[0]['formatted_address']);
	        });

	        this.loadMap()

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
      });

      /**/
    }
  }

  previewOffline(m)
  {
    if (m.type == "video") {
      let options: StreamingVideoOptions = {
        successCallback: () => { console.log('Video played') },
        errorCallback: (e) => { console.log('Error streaming') },
        shouldAutoClose: true,
        controls: true
      };
      this.streamingMedia.playVideo(m.file, options);
    }else if(m.type == "image") {
      this.photoViewer.show(m.file);
    }else if(m.type == "audio") {
    //   this.photoViewer.show( decodeURIComponent(m.preview), '', {share: false,});
      this.showStop = true;
      
      try {
        this.audio = this.media1.create(m.file);
        // this.audio.play();

        this.audio.onStatusUpdate.subscribe(status => 
          {
            if (status == 2) {
              if (!this.doPause) {
                this.time = "00:00:00";
                this.sec = 0;
                this.min = 0;
                this.hrs = 0;
              }
              this.timer();
            }

            if (status == 4) {

              this.time = "00:00:00";
              this.sec = 0;
              this.min = 0;
              this.hrs = 0;
              clearTimeout(this.t);

            }
          }
        );

        this.audio.setVolume(0.8);
      } catch (error) {

        console.log(error);
      }
      return false;
    }
  }

  info()
  {
  	localStorage.setItem('navParamsInformation',JSON.stringify({sin_number:this.data['sin_number']}));
  	this.navCtrl.navigateForward('information');
    // this.navCtrl.push(InformationPage,{sin_number:this.data['sin_number']})
  }

  uploadExternalImageTech(path)
  {
    return new Promise(resolve => {

      const fileTransfer: FileTransferObject = this.transfer.create();

      let lat = localStorage.getItem('photolat');
      let lng = localStorage.getItem('photolng');
      let address = localStorage.getItem('photoaddress');
      let imagePath = path;
      let date = localStorage.getItem('photodate');

      console.log(imagePath);

      let options: FileUploadOptions = {
         fileKey: 'file',
         fileName: 'ionicFile.jpg',
         chunkedMode: false,
         params: {id: JSON.parse(localStorage.getItem('techUser'))['id'], lat: lat, lng: lng, address: address, sin_number: this.data['sin_number'], offline:0, date: date},
         headers:{Connection: 'close'}
      }
      let loading = this.loading.create({
        message: "Uploading image file..."
      });
      loading.then(l=>{l.present()});

      fileTransfer.upload(imagePath, this.api.url+'/api/uploadExternalImageTech', options)
       .then((data) => {

        setTimeout(()=>{
          resolve(true);
        },500);
        
        this.loading.dismiss();
          
       }, (err) => {

         resolve(true);

         this.loading.dismiss();
         
         console.log(JSON.stringify(err, Object.getOwnPropertyNames(err)));

         alert('upload err: '+JSON.stringify(err, Object.getOwnPropertyNames(err)));
       })

    })
  }

  private b64toBlob = (b64Data, contentType='', sliceSize=512) => {
    const byteCharacters = atob(b64Data);
    const byteArrays = [];

    for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
      const slice = byteCharacters.slice(offset, offset + sliceSize);

      const byteNumbers = new Array(slice.length);
      for (let i = 0; i < slice.length; i++) {
        byteNumbers[i] = slice.charCodeAt(i);
      }

      const byteArray = new Uint8Array(byteNumbers);
      byteArrays.push(byteArray);
    }

    const blob = new Blob(byteArrays, {type: contentType});
    return blob;
  }

}
