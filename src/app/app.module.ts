import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { IonicModule, IonicRouteStrategy } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';

import { EventsService } from './services/events.service';
import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';

// import { DamagePipe } from './pipes/damage.pipe';
// import { OfflinePipe } from './pipes/offline.pipe';

import { PipesModule } from './pipes/pipes.module';

import { OneSignal } from '@ionic-native/onesignal/ngx';
import { Network } from '@ionic-native/network/ngx';
import { FileTransfer } from '@ionic-native/file-transfer/ngx';
import { LongPressDirective } from './long-press.directive';
import { File } from '@ionic-native/file/ngx';


@NgModule({
  declarations: [AppComponent, LongPressDirective],
  entryComponents: [],
  imports: [
    BrowserModule,
    IonicModule.forRoot(),
    AppRoutingModule,
    PipesModule,
    HttpClientModule
  ],
  providers: [
    StatusBar,
    SplashScreen,
    EventsService,
    // HttpClient,
    File,
    OneSignal,
    Network,
    FileTransfer,
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}
