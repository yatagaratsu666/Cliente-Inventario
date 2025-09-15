import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateAuctionFormComponent } from './create-auction-form.component';

describe('CreateAuctionFormComponent', () => {
  let component: CreateAuctionFormComponent;
  let fixture: ComponentFixture<CreateAuctionFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreateAuctionFormComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CreateAuctionFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
