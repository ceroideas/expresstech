import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { EventsService } from '../services/events.service';

@Component({
  selector: 'app-folder',
  templateUrl: './folder.page.html',
  styleUrls: ['./folder.page.scss']
})
export class FolderPage implements OnInit {
  public folder: string;

  constructor(private activatedRoute: ActivatedRoute, public events: EventsService) { }

  ngOnInit() {
    this.folder = this.activatedRoute.snapshot.paramMap.get('id');

    // this.events.subscribe('my:function',(data) => {
    //   console.log("randomFunction was fired!",data);
    // });
  }

  randomFunction() {
	  this.events.publish('my:function',{data:"hola"});
  }

}
