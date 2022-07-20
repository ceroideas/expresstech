/*import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-information',
  templateUrl: './information.page.html',
  styleUrls: ['./information.page.scss'],
})
export class InformationPage implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}*/

import { Component, OnInit } from '@angular/core';
import { NavController, AlertController, LoadingController } from '@ionic/angular';
import { ApiService } from '../../services/api.service';
import { EventsService } from '../../services/events.service';

/**
 * Generated class for the InformationPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@Component({
  selector: 'app-information',
  templateUrl: './information.page.html',
  styleUrls: ['./information.page.scss'],
})
export class InformationPage implements OnInit {

  info:any = [];
  navParams;

  typologies = [];
  typology;
  sections = [];


  constructor(public navCtrl: NavController, public alertCtrl: AlertController, public loadingCtrl: LoadingController, public api: ApiService, public events: EventsService) {

  	this.navParams = JSON.parse(localStorage.getItem('navParamsInformation'));

  	if (localStorage.getItem('connected') == 'true') {
	  	let load = this.loadingCtrl.create();
	  	load.then(l=>{
	  		l.present()
	  		
		  	this.api.loadInformation(this.navParams['sin_number'])
		  	.subscribe((data:any)=>{

		  		if (data[1] == 'information') {
			  		
			  		let info = JSON.parse(JSON.parse(data[0]));

			  		this.info = {"main_information":[
				  			{"key":"typology","question":"Partita di danno","value":info['typology']},
				  			{"key":"sin_number","question":"Riferimento Interno","value":this.navParams['sin_number']}
				  		],"questions":[]
				  	};

		  		}else{

		  			this.info = data[0];

		  		}

		  		console.log(this.info);

		  		l.dismiss();

		  		this.getTypologies();
		  	})
	  	});
  	}else{
  		if (localStorage.getItem('information-'+(this.navParams['sin_number']))) {	
  			this.info = JSON.parse(localStorage.getItem('information-'+(this.navParams['sin_number'])))
  		}else{
  			this.info['sin_number'] = this.navParams['sin_number'];
  		}
  	}
  }

  ionViewWillLeave()
  {
    this.confirmInformation(false);
  }

  ngOnInit() {
  	
  }

  getTypologies()
  {
  	this.api.getTypologies().subscribe((data:any)=>{
  		this.typologies = data;

  		setTimeout(()=>{
  			this.typology = this.info.typology;
  		},500)

  	});
  }

  selectTypology()
  {
  	this.api.getSections(this.typology).subscribe((data:any)=>{
  		this.sections = data;
  	})
  }

  confirmInformation(back = true)
  {
  	let questions = [];
  	let q = document.getElementsByClassName('question');

  	for (let i = 0; i < q.length; i++)
  	{
  		let el = (q[i] as HTMLInputElement);
  		if (el.classList.contains('ckeckboxes')) {
  			// console.log(el.dataset['question'],el.dataset['id'],'checkbox');
  			let r = el.getElementsByTagName('ion-checkbox');
  			let value = [];
  			for(let j = 0; j < r.length; j++)
  			{
  				let sub_el = r[j];
  				if (sub_el.checked) {
  					value.push(sub_el.value);
  				}
  			}
  			questions.push({"q":el.dataset['question'],"v":value,"id":el.dataset['id']});
  		}else{
  			questions.push({"q":el.dataset['question'],"v":[el.value],"id":el.dataset['id']});
  		}
  	}

  	this.info['questions'] = questions;
  	this.info['typology'] = this.typology;
  	this.info['sin_number'] = this.navParams['sin_number'];

  	console.log(this.info);

  	let load = this.loadingCtrl.create();
  	load.then(l=>{
  		l.present()
	  	if (localStorage.getItem('connected') == 'true') {
	  		this.api.uploadInformation(this.info)
	  		.subscribe(data=>{
	  			l.dismiss();
	  			console.log(data);

          if (back) {
	  			  this.navCtrl.pop();
          }
	  			let alert = this.alertCtrl.create({message: "Le informazioni sono state salvate correttamente"})
	  			alert.then(a=>a.present());
	        this.events.publish('RELOAD:SINISTER',false);
	        this.events.publish('RELOAD:INSIDE');
	      })
	    }else{
	      let infos = [];
	      if (localStorage.getItem('infos')) {
	        infos = JSON.parse(localStorage.getItem('infos'));
	      }
	      if (infos.indexOf(this.navParams['sin_number']) == -1) {
	        infos.push(this.navParams['sin_number']);
	      }

	      localStorage.setItem('infos',JSON.stringify(infos));
	      localStorage.setItem('information-'+(this.navParams['sin_number']),JSON.stringify(this.info));

	      this.navCtrl.back();
	      let alert = this.alertCtrl.create({message: "Le informazioni verrà caricato quando viene ripristinata la connessione Internet"})
	      alert.then(a=>a.present());
	      this.events.publish('RELOAD:SINISTER',false);
	      this.events.publish('RELOAD:INSIDE');
	  	}
  	});
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad InformationPage');
  }

}
