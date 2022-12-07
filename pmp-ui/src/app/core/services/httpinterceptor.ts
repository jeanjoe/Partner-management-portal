import { Injectable } from "@angular/core";
import { tap } from "rxjs/operators";
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpResponse,
  HttpErrorResponse,
} from "@angular/common/http";
import { Observable } from "rxjs";
import { LoginRedirectService } from "./loginredirect.service";
import { HeaderService } from "./header.service";
import { MatDialog } from "@angular/material";
import { DialogComponent } from "src/app/shared/dialog/dialog.component";
import { TranslateService } from "@ngx-translate/core";
import { AppConfigService } from "src/app/app-config.service";
import jwt_decode from "jwt-decode";

@Injectable({
  providedIn: "root",
})
export class AuthInterceptor implements HttpInterceptor {
  errorMessages: any;
  decoded: any;

  constructor(
    private redirectService: LoginRedirectService,
    private headerService: HeaderService,
    private dialog: MatDialog,
    private translateService: TranslateService,
    private appService: AppConfigService
  ) {}
  // function which will be called for all http calls
  intercept(
    request: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    request = request.clone({
      withCredentials: true,
    });
    return next.handle(request).pipe(
      tap(
        (event) => {
          if (event instanceof HttpResponse) {
            if (event.url.split("/").includes("validateToken")) {
              if (event.body.response) {
                this.decoded = jwt_decode(event.body.response.token);
                this.headerService.setlanguageCode(this.decoded["locale"]);
                this.headerService.setEmailId(this.decoded["email"]);
                this.headerService.setOrganizationName(
                  this.decoded["organizationName"]
                );
                this.headerService.setAddress(this.decoded["addressTest"]);
                this.headerService.setContactNumber(
                  this.decoded["phoneNumber"]
                );
                this.headerService.setPartnerType(this.decoded["partnerType"]);
                this.headerService.setUsername(event.body.response.userId);
                this.headerService.setRoles(event.body.response.role);
              }
            }
          }
        },
        (err) => {
          if (err instanceof HttpErrorResponse) {
            console.log(err.status);
            if (err.status === 401 || err.status === 403) {
              this.redirectService.redirect(window.location.href);
            } else {
              this.translateService
                .getTranslation(this.appService.getConfig().primaryLangCode)
                .subscribe((response) => {
                  this.errorMessages = response.errorPopup;
                  this.dialog.open(DialogComponent, {
                    width: "868px",
                    height: "190px",
                    data: {
                      case: "MESSAGE",
                      title: this.errorMessages.technicalError.title,
                      message: this.errorMessages.technicalError.message,
                      btnTxt: this.errorMessages.technicalError.btnTxt,
                    },
                    disableClose: true,
                  });
                });
            }
          }
        }
      )
    );
  }
}
