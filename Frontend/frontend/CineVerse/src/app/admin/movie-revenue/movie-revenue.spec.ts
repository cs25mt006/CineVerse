import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MovieRevenue } from './movie-revenue';

describe('MovieRevenue', () => {
  let component: MovieRevenue;
  let fixture: ComponentFixture<MovieRevenue>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MovieRevenue]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MovieRevenue);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
