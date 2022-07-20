import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'information'
})
export class InformationPipe implements PipeTransform {

  transform(info: any, id: any, type:any, option:any = null): any {

  	let q = info.questions;

  	let v = q.find(x=>x.id == id);

  	if (type == 'checkbox') {

  		if (v) {
  			for(let i = 0; i < v.v.length; i++)
  			{
  				let a = v.v[i];
  				if (option == a) {
  					return true;
  				}

  			}
  		}
  		return false;
  		
  	}else{
  		if (v) {
  			return v.v[0];
  		}
  	}
  }

}
