import { Injectable } from '@angular/core';
import { BehaviorSubject, of } from 'rxjs';
import { take, map, tap, delay, switchMap } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';

import { Place } from './places.model';
import { AuthService } from '../auth/auth.service';

interface PlaceData {
  title: string;
  description: string;
  imageUrl: string;
  price: number;
  availableFrom: string;
  availableTo: string;
  userId: string;
}
@Injectable({
  providedIn: 'root'
})

// new Place(
//   'p1',
//   'Manhattan Mansion',
//   'In the heart of New York City.',
//   'https://images.pexels.com/photos/466685/pexels-photo-466685.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940',
//   149.99,
//   new Date('2019-01-01'),
//   new Date('2019-12-31'),
//   'abc'
// ),
// new Place(
//   'p2',
//   'L\'Amour Toujours',
//   'A romantic place in Paris!',
//   'https://images.pexels.com/photos/338515/pexels-photo-338515.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940',
//   189.99,
//   new Date('2019-01-01'),
//   new Date('2019-12-31'),
//   'abc'
// ),
// new Place(
//   'p3',
//   'The Foggy Palace',
//   'Not your average city trip!',
//   'https://images.pexels.com/photos/1141853/pexels-photo-1141853.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940',
//   99.99,
//   new Date('2019-01-01'),
//   new Date('2019-12-31'),
//   'abc'
// )

export class PlacesService {
  // tslint:disable-next-line: variable-name
  private _places = new BehaviorSubject<Place[]>([]);

  get places() {
    return this._places.asObservable();
  }

  constructor(private authService: AuthService, private http: HttpClient) { }

  fetchPlaces() {
    return this.http.get<{ [key: string]: PlaceData }>('https://discover-places-f7d22.firebaseio.com/offered-places.json')
      .pipe(map(resData => {
        const places = [];
        for (const key in resData) {
          if (resData.hasOwnProperty(key)) {
            places.push(new Place(
              key,
              resData[key].title,
              resData[key].description,
              resData[key].imageUrl,
              resData[key].price,
              new Date(resData[key].availableFrom),
              new Date(resData[key].availableTo),
              resData[key].userId
            ));
          }
        }
        return places;
      }),
        tap(places => {
          this._places.next(places);
        })
      );
  }

  getPlace(id: string) {
    return this.http.get<PlaceData>(`https://discover-places-f7d22.firebaseio.com/offered-places/${id}.json`)
      .pipe(
        map(placeData => {
          return new Place(
            id,
            placeData.title,
            placeData.description,
            placeData.imageUrl,
            placeData.price,
            new Date(placeData.availableFrom),
            new Date(placeData.availableTo),
            placeData.userId
          );
        })
      );
  }

  addPlace(
    title: string,
    description: string,
    price: number,
    dateFrom: Date,
    dateTo: Date
  ) {
    let generatedId: string;
    const newPlace = new Place(
      Math.random().toString(),
      title,
      description,
      'https://images.pexels.com/photos/338515/pexels-photo-338515.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940',
      price,
      dateFrom,
      dateTo,
      this.authService.userId
    );
    return this.http.post<{ name: string }>(
      'https://discover-places-f7d22.firebaseio.com/offered-places.json',
      { ...newPlace, id: null })
      .pipe(
        switchMap(resData => {
          generatedId = resData.name;
          return this.places;
        }),
        take(1),
        tap(places => {
          this._places.next(places.concat(newPlace));
        })
      );
  }

  updatePlace(placeId: string, title: string, description: string) {
    let updatedPlaces: Place[];
    return this.places.pipe(
      take(1),
      switchMap(places => {
        if (!places || places.length <= 0) {
          return this.fetchPlaces();
        } else {
          return of(places);
        }
      }),
      switchMap(places => {
        const updatedPlacesIndex = places.findIndex(pl => pl.id === placeId);
        updatedPlaces = [...places];
        const oldPlace = updatedPlaces[updatedPlacesIndex];
        updatedPlaces[updatedPlacesIndex] = new Place(
          oldPlace.id,
          title,
          description,
          oldPlace.imageUrl,
          oldPlace.price,
          oldPlace.availableFrom,
          oldPlace.availableTo,
          oldPlace.userId
        );
        return this.http.put(`https://discover-places-f7d22.firebaseio.com/offered-places/${placeId}.json`,
          { ...updatedPlaces[updatedPlacesIndex], id: null });
      }),
      tap(() => {
        this._places.next(updatedPlaces);
      }));
  }
}
