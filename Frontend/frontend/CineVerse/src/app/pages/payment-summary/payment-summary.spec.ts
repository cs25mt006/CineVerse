import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PaymentSummary } from './payment-summary';

describe('PaymentSummary', () => {
  let component: PaymentSummary;
  let fixture: ComponentFixture<PaymentSummary>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PaymentSummary]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PaymentSummary);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
