import { HttpClient, HttpErrorResponse } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Router } from "@angular/router";
import { catchError, tap } from "rxjs/operators";
import { BehaviorSubject, throwError } from "rxjs";

import { environment } from "src/environments/environment.development";
import { User } from "./user.model";

export interface AuthResponseData {
    kind: string
    idToken: string
    email: string	
    refreshToken: string
    expiresIn: string
    localId: string
    registered?: boolean
}

@Injectable({ providedIn: 'root' })
export class AuthService {
    user = new BehaviorSubject<User>(null)
    private tokenExpTimer: any

    constructor(private http: HttpClient, private router: Router) {}

    signup(email: string, password: string) {
        return this.http.post<AuthResponseData>(
            `https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${environment.fbAPIKey}`,
            {
                email: email,
                password: password,
                returnSecureToken: true
            }
        ).pipe(catchError(this.handleError), tap((resData) => {
            this.handleAuth(
                resData.email, 
                resData.localId, 
                resData.idToken, 
                +resData.expiresIn
            )
        }))
    }

    login(email: string, password: string) {
        return this.http.post<AuthResponseData>(
            `https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${environment.fbAPIKey}`,
            {
                email: email,
                password: password,
                returnSecureToken: true
            }
        ).pipe(catchError(this.handleError), tap((resData) => {
            this.handleAuth(
                resData.email, 
                resData.localId, 
                resData.idToken, 
                +resData.expiresIn
            )
        }))
    }

    autoLogin() {
        const userData: {
            email: string
            id: string
            _token: string
            _tokenExpirationDate: string
        } = JSON.parse(localStorage.getItem('userData'))
        if (!userData) {
            return
        }
        const loadedUser = new User(
            userData.email, 
            userData.id, 
            userData._token, 
            new Date(userData._tokenExpirationDate)
        )

        if (loadedUser.token) {
            this.user.next(loadedUser)
            const expirationDuration = new Date(userData._tokenExpirationDate).getTime() - new Date().getTime()
            this.autoLogout(expirationDuration)
        }
    }

    logout() {
        this.user.next(null)
        this.router.navigate(['/auth'])
        localStorage.removeItem('userData')
        if (!this.tokenExpTimer) {
            clearTimeout(this.tokenExpTimer)
        }
        this.tokenExpTimer = null
    }

    autoLogout(expirationDuration: number) {
        this.tokenExpTimer = setTimeout(() => {
            this.logout() 
        }, expirationDuration)
    }
    
    private handleAuth(email: string, usedId: string, token: string, expIn: number) {
        const expDate = new Date(new Date().getTime() + +expIn * 1000)
        const user = new User(
            email, 
            usedId, 
            token,
            expDate
        )
    
        this.user.next(user)
        this.autoLogout(expIn * 1000)

        localStorage.setItem('userData', JSON.stringify(user))
    }

    private handleError(errorRes: HttpErrorResponse) {
        let errorMessage = 'An unknown error occured'
        if (!errorRes.error || !errorRes.error.error) {
            return throwError(errorMessage)
        }
        switch (errorRes.error.error.message) {
            case 'EMAIL_EXISTS':
                errorMessage = 'This email exists already'
                break
            case 'EMAIL_NOT_FOUND':
                errorMessage = 'This email doesn not exit'
                break
            case 'INVALID_LOGIN_CREDENTIALS':
                errorMessage = 'Invalid email or password'
                break
        }
        return throwError(errorMessage)
    }
}