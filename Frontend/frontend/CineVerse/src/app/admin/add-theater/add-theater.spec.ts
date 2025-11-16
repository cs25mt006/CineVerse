import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddTheater } from './add-theater';

describe('AddTheater', () => {
  let component: AddTheater;
  let fixture: ComponentFixture<AddTheater>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddTheater]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddTheater);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
