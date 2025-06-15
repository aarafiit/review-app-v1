import {Component} from '@angular/core';
import {RouterOutlet} from '@angular/router';
import {ReviewsComponent} from "./reviews/reviews.component";
import {SearchableInputComponent} from "./searchable-input/searchable-input.component";
import {NgbTypeahead} from "@ng-bootstrap/ng-bootstrap";
import {FormsModule} from "@angular/forms";
import {HttpClientModule} from "@angular/common/http";
import {MatButtonModule} from "@angular/material/button";
import {MatDividerModule} from "@angular/material/divider";
import {MatIconModule} from "@angular/material/icon";
import {NavBarComponent} from "./nav-bar/nav-bar.component";

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
    ReviewsComponent,
    SearchableInputComponent,
    NgbTypeahead,
    FormsModule,
    HttpClientModule,
    MatButtonModule, MatDividerModule, MatIconModule, NavBarComponent
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
}
