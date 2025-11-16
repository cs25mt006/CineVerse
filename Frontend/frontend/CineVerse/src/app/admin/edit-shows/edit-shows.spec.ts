import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditShows } from './edit-shows';

describe('EditShows', () => {
  let component: EditShows;
  let fixture: ComponentFixture<EditShows>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditShows]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EditShows);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
