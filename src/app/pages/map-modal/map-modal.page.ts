import { Component, ViewChild, ElementRef, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { FileTransfer, FileUploadOptions, FileTransferObject } from '@ionic-native/file-transfer/ngx';

import { ApiService } from '../../services/api.service';
import { EventsService } from '../../services/events.service';

declare var google;

@Component({
  selector: 'app-map-modal',
  templateUrl: './map-modal.page.html',
  styleUrls: ['./map-modal.page.scss'],
  providers: [FileTransfer]
})
export class MapModalPage implements OnInit {

  @ViewChild('map1') mapElement: ElementRef;
  map;
  marker;
  address = localStorage.getItem('address');
  date;

  constructor(private transfer: FileTransfer, public modal: ModalController, public events: EventsService) { }

  ngOnInit() {
    setTimeout(()=>{
      this.loadMap();
      this.initAutocomplete();
    },1000)
  }

  loadMap(){

    console.log('1')
 
    let latLng = new google.maps.LatLng(localStorage.getItem('lat'), localStorage.getItem('lng'));

    localStorage.setItem('photolat',localStorage.getItem('lat'));
    localStorage.setItem('photolng',localStorage.getItem('lng'));

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

    this.marker = new google.maps.Marker({
      map: this.map,
      animation: google.maps.Animation.DROP,
      position: this.map.getCenter(),
      draggable:true
    });

    let handleEvent = (event) =>
    {
      localStorage.setItem('photolat',event.latLng.lat());
      localStorage.setItem('photolng',event.latLng.lng());

      this.geocodeLatLng({lat: event.latLng.lat(), lng: event.latLng.lng()});
    }

    this.marker.addListener('dragend', handleEvent);

  }

  geocodeLatLng(latlng) {

    console.log(latlng);

    const geocoder = new google.maps.Geocoder();

    geocoder.geocode({'location': latlng}, (results, status) => {
        if (status === 'OK') {
          if (results[0]) {
            this.address = results[0].formatted_address;
          } else {
            window.alert('No results found');
          }
        } else {
          window.alert('Geocoder failed due to: ' + status);
        }
    });
  }

  initAutocomplete()
  {
    var geocoder = new google.maps.Geocoder;
    var input = document.querySelector('#address1 input');
    var options = {
      types: ['address']
    };

    const autocomplete = new google.maps.places.Autocomplete(input, options);

    autocomplete.setComponentRestrictions(
        {'country': 'it'});

    let fillInAddress = ()=> {
      // Get the place details from the autocomplete object.
      var arr = autocomplete.getPlace();
      // document.getElementById('searchTextField').value = "";

      var latlng = {lat:arr.geometry.location.lat(),lng:arr.geometry.location.lng()};

      localStorage.setItem('photolat',arr.geometry.location.lat());
      localStorage.setItem('photolng',arr.geometry.location.lng());

      this.marker.setMap(null);

      this.marker = new google.maps.Marker({
        position: latlng,
        map: this.map,
        draggable:true,
      });

        this.map.setCenter(latlng);

        google.maps.event.addListener(this.marker,'dragend',(event) => {
            localStorage.setItem('photolat',event.latLng.lat());
            localStorage.setItem('photolng',event.latLng.lng());

        this.geocodeLatLng({lat: event.latLng.lat(), lng: event.latLng.lng()});
      });
    }

    autocomplete.addListener('place_changed', fillInAddress);
  }

  confirmInformation()
  {
    if (!this.address) {
      return false;
    }
    localStorage.setItem('photodate',this.date);
    localStorage.setItem('photoaddress',this.address);

    this.modal.dismiss();
    this.events.publish('uploadExtraFile');
  }

}
