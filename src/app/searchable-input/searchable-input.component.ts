import {ChangeDetectorRef, Component, EventEmitter, Input, Output} from '@angular/core';
import {HttpClient, HttpParams} from "@angular/common/http";
import {debounceTime, distinctUntilChanged, map, mergeMap, Observable, OperatorFunction} from "rxjs";
import {FormsModule} from "@angular/forms";
import {NgbTypeahead} from "@ng-bootstrap/ng-bootstrap";
import { catchError, of } from 'rxjs';
import {environment} from "../../environment/environment.development";


@Component({
  selector: 'searchable-input',
  standalone: true,
  imports: [
    FormsModule,
    NgbTypeahead
  ],
  templateUrl: './searchable-input.component.html',
  styleUrl: './searchable-input.component.css'
})
export class SearchableInputComponent {
  constructor(
    private http: HttpClient,
    private cdr: ChangeDetectorRef
  ) {
  }


  @Input()
  public model: any;

  @Input("url-to-search")
  urlToSearch: string  = environment.apiUrl;

  @Input("title")
  title: string = 'Search Here';

  @Input("threshold-length")
  thresholdLength = 0;

  @Input()
  showLabel = true;

  @Input()
  showSmForm = false;

  @Input()
  disabled = false;


  @Output("on-select") onSelect = new EventEmitter<any>();

  ngOnInit() {
    this.cdr.detectChanges();
  }

  @Input()
  formatter = (result: any) =>'['+result.alias.toUpperCase()+'] '+result.name;

  search: OperatorFunction<string, readonly any[]> = (text$: Observable<string>) =>
    text$.pipe(
      debounceTime(200),
      distinctUntilChanged(),
      mergeMap((term: string) => term.length < this.thresholdLength
        ? of([])
        : this.getFromUrl(term).pipe(
          map((searchModels: any[]) => searchModels),
          catchError((error) => {
            console.error('Search API error:', error);
            return of([]);
          })
        )
      )
    )

  changeModel(model: any): void {
    if (this.onSelect != null) {
      this.onSelect.emit(model);
    }
  }

  private getFromUrl(text: string): Observable<any> {
    let params = new HttpParams();
    params = params.set('searchParam', text);
    console.log(this.urlToSearch);

    return this.http.get(`${environment.apiUrl + this.urlToSearch}`, { params }).pipe(
      catchError((error) => {
        console.error('HTTP Error:', error);

        // Handle different error types
        if (error.status === 500) {
          console.error('Server error - please try again later');
          // You could show a toast/notification here
        } else if (error.status === 404) {
          console.error('API endpoint not found');
        } else if (error.status === 0) {
          console.error('Network error - check connection');
        }

        // Return empty array or throw error
        return of([]); // Return empty results
        // OR re-throw to handle elsewhere: return throwError(error);
      })
    );
  }

  openTypeahead(inp : any) {
    inp._nativeElement.value = '';
    inp._nativeElement.dispatchEvent(new Event('input'));
    inp._nativeElement.focus();
  }
}
