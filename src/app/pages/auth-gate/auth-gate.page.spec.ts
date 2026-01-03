import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AuthGatePage } from './auth-gate.page';

describe('AuthGatePage', () => {
  let component: AuthGatePage;
  let fixture: ComponentFixture<AuthGatePage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(AuthGatePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
