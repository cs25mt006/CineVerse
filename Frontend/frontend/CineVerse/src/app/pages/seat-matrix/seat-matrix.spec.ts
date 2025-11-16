import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SeatMatrix } from './seat-matrix';

describe('SeatMatrix', () => {
  let component: SeatMatrix;
  let fixture: ComponentFixture<SeatMatrix>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SeatMatrix]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SeatMatrix);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
