import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MovieCards } from './movie-cards';

describe('MovieCards', () => {
  let component: MovieCards;
  let fixture: ComponentFixture<MovieCards>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MovieCards]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MovieCards);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
