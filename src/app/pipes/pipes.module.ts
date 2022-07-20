import { NgModule } from '@angular/core';
import { DamagePipe } from './damage.pipe';
import { OfflinePipe } from './offline.pipe';
import { InformationPipe } from './information.pipe';

@NgModule({
	declarations: [DamagePipe,OfflinePipe, InformationPipe],
	imports: [],
	exports: [DamagePipe,OfflinePipe, InformationPipe]
})
export class PipesModule {}
