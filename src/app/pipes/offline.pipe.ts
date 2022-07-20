// import { Pipe, PipeTransform } from '@angular/core';

// @Pipe({
//   name: 'offline'
// })
// export class OfflinePipe implements PipeTransform {

//   transform(value: unknown, ...args: unknown[]): unknown {
//     return null;
//   }

// }

import { Pipe, PipeTransform } from '@angular/core';

/**
 * Generated class for the OfflinePipe pipe.
 *
 * See https://angular.io/api/core/Pipe for more info on Angular Pipes.
 */
@Pipe({
  name: 'offline',
})
export class OfflinePipe implements PipeTransform {
  /**
   * Takes a value and makes it lowercase.
   */
  transform(id) {
  	if (!localStorage.getItem('offlineClaims')) {
  		return [];
  	}
  	let offline = JSON.parse(localStorage.getItem('offlineClaims'));
  	return offline.filter(x => x.claim_id == id);
  }
}
