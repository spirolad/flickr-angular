import {Component, OnInit} from '@angular/core';
import {PhotoViewer} from './photo-viewer/photo-viewer';

@Component({
  selector: 'app-root',
  imports: [
    PhotoViewer
  ],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements OnInit {

  constructor() {
  }

  ngOnInit() {
  }

}
