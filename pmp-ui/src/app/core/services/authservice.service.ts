import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable, of } from "rxjs";
import { catchError, map } from "rxjs/operators";
import { AppConfigService } from "src/app/app-config.service";

/**
 * @description AuthService for Admin App
 * @author Urvil Joshi
 */
@Injectable()
export class AuthService {
  constructor(private http: HttpClient, private appService: AppConfigService) {}
  rolesString: string;
  token: string;
  roles: string[];
  isAuthenticated(): Observable<boolean> {
    return this.http
      .get(
        `${
          this.appService.getConfig().baseUrl
        }v1/partnermanager/authorize/admin/validateToken`,
        { observe: "response" }
      )
      .pipe(
        map((res) => res.status === 200),
        catchError((error) => {
          console.log(error);
          return of(true);
        })
      );
  }
}
