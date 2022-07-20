// import { Pipe, PipeTransform } from '@angular/core';

// @Pipe({
//   name: 'damage'
// })
// export class DamagePipe implements PipeTransform {

//   transform(value: unknown, ...args: unknown[]): unknown {
//     return null;
//   }

// }

import { Pipe, PipeTransform } from '@angular/core';

/**
 * Generated class for the DamagePipe pipe.
 *
 * See https://angular.io/api/core/Pipe for more info on Angular Pipes.
 */
@Pipe({
  name: 'damage',
})
export class DamagePipe implements PipeTransform {
  /**
   * Takes a value and makes it lowercase.
   */
  transform(value: any) {
    if (value && value != "") {
      // return value;
      // code...
      let arr = JSON.parse(value);

      console.log(arr)

      if (arr) {
        if (arr['typology']) {
          return arr['typology'];
        }
        return "N / A";
      }
    }

    return "N / A";
  }
}
