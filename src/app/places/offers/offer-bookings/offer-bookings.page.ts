import { Component, OnInit } from '@angular/core';
import { NavController } from '@ionic/angular';
import { Place } from '../../places.model';
import { ActivatedRoute } from '@angular/router';
import { PlacesService } from '../../places.service';

@Component({
  selector: 'app-offer-bookings',
  templateUrl: './offer-bookings.page.html',
  styleUrls: ['./offer-bookings.page.scss'],
})
export class OfferBookingsPage implements OnInit {
  place: Place;

  constructor(
    private navCtrl: NavController,
    private route: ActivatedRoute,
    private placesServices: PlacesService
  ) { }

  ngOnInit() {
    this.route.paramMap.subscribe(paramMap => {
      if (!paramMap.has('placeId')) {
        this.navCtrl.navigateBack('places/tabs/offers');
        return;
      }
      this.place = this.placesServices.getPlace(paramMap.get('placeId'));
    });
  }

  goBack() {
    this.navCtrl.navigateBack('places/tabs/offers');
  }

}
